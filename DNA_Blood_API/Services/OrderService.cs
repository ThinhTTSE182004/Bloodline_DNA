using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IStaffAssignmentService _staffAssignmentService;
        private readonly ISampleTransferRepository _sampleTransferService;
        public OrderService(
            IOrderRepository orderRepository,
            IStaffAssignmentService staffAssignmentService,
            ISampleTransferRepository sampleTransferRepository)
        {
            _orderRepository = orderRepository;
            _staffAssignmentService = staffAssignmentService;
            _sampleTransferService = sampleTransferRepository;
        }

        public async Task<OrderHistoryDTO?> ConfirmOrderAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderWithNavigationByIdAsync(orderId);
            if (order == null) return null;

            if (order.Payment.PaymentStatus != "Pending")
            {
                throw new InvalidOperationException("Order is not in a pending state.");
            }

            order.Payment.PaymentStatus = "PaymentCompleted";
            await _orderRepository.UpdateOrderAsync(order);

            // Trả về DTO sau khi cập nhật
            return new OrderHistoryDTO
            {
                OrderId = order.OrderId,
                ServiceName = order.OrderDetails.FirstOrDefault()?.ServicePackage?.ServiceName ?? "Unknown",
                OrderDate = order.CreateAt ?? DateTime.Now,
                OrderStatus = order.OrderStatus,
                PaymentStatus = order.Payment.PaymentStatus,
                TotalAmount = order.Payment?.Total ?? 0,
                PaymentMethod = order.Payment?.PaymentMethod ?? "Unknown",
                SampleCollectionMethod = order.CollectionMethod?.MethodName ?? "Unknown"
            };
        }


        public async Task<List<OrderHistoryDTO>> GetAllOrdersForStaffAsync()
        {
            var orders = await _orderRepository.GetOrdersWithNavigationAsync();

            return orders.Select(o => new OrderHistoryDTO
            {
                OrderId = o.OrderId,
                ServiceName = o.OrderDetails.FirstOrDefault()?.ServicePackage?.ServiceName ?? "Unknown",
                OrderDate = o.CreateAt ?? DateTime.Now,
                OrderStatus = o.OrderStatus,
                TotalAmount = o.Payment?.Total ?? 0,
                PaymentMethod = o.Payment?.PaymentMethod ?? "Unknown",
                PaymentStatus = o.Payment?.PaymentStatus ?? "Pending",
                SampleCollectionMethod = o.CollectionMethod?.MethodName ?? "Unknown"
            })
            .OrderByDescending(o => o.OrderDate)
            .ToList();
        }


        public async Task<int> CreateOrderWithPaymentAsync(CreateOrderWithPaymentDTO dto)
        {
            // Validate test type by name
            var testType = await _orderRepository.GetTestTypeByNameAsync(dto.TestTypeName);
            if (testType == null)
                throw new Exception($"Test type '{dto.TestTypeName}' not found");

            // Validate sample type by name
            var sampleType = await _orderRepository.GetSampleTypeByNameAsync(dto.SampleTypeName);
            if (sampleType == null)
                throw new Exception($"Sample type '{dto.SampleTypeName}' not found");

            // Validate collection method by name
            var collectionMethod = await _orderRepository.GetCollectionMethodByNameAsync(dto.MethodTypeName);
            if (collectionMethod == null)
                throw new Exception($"Collection method '{dto.MethodTypeName}' not found");

            try
            {
                // 1. Create participant
                var participant = new Participant
                {
                    FullName = dto.Participant.FullName,
                    Sex = dto.Participant.Sex,
                    BirthDate = dto.Participant.BirthDate,
                    Phone = dto.Participant.Phone,
                    Relationship = dto.Participant.Relationship,
                    NameRelation = dto.Participant.NameRelation
                };

                // 2. Create order
                var order = new Order
                {
                    CustomerId = dto.CustomerId,
                    CollectionMethodId = collectionMethod.CollectionMethodId,
                    OrderStatus = "Pending",
                    CreateAt = DateTime.Now
                };

                // 3. Create order details, samples, transfer info, sample kits
                var details = new List<OrderDetail>();
                var samples = new List<Sample>();
                var sampleKits = new List<SampleKit>();
                var sampleTransferInfos = new List<(int StaffId, int MedicalStaffId)>();

                foreach (var detailDto in dto.Details)
                {
                    // Tự động phân công staff
                    var (medicalStaffId, staffId) = await _staffAssignmentService.AssignStaffAsync(detailDto.ServicePackageId);

                    var detail = new OrderDetail
                    {
                        ServicePackageId = detailDto.ServicePackageId,
                        MedicalStaffId = medicalStaffId
                    };
                    details.Add(detail);

                    var sample = new Sample
                    {
                        SampleTypeId = sampleType.SampleTypeId,
                        StaffId = staffId,
                        SampleStatus = "Pending",
                        CollectedDate = null,
                        ReceivedDate = null
                    };
                    samples.Add(sample);

                    sampleTransferInfos.Add((staffId, medicalStaffId));

                    if (collectionMethod.MethodName == "At Home")
                    {
                        var sampleKit = new SampleKit
                        {
                            OrderDetail = detail,
                            StaffId = staffId,
                            Name = "",
                            KitCode = $"KIT{DateTime.Now:yyyyMMddHHmmss}{new Random().Next(100, 999)}",
                            IntructionUrl = "",
                            CreateAt = DateTime.Now,
                            UpdateAt = null,
                            SendDate = null,
                            ReceivedDate = null
                        };
                        sampleKits.Add(sampleKit);
                    }
                }

                // 4. Create payment
                var payment = new Payment
                {
                    PaymentMethod = dto.Payment.PaymentMethod,
                    PaymentStatus = "Pending",
                    PaymentDate = DateTime.Now,
                    Total = (int)dto.Payment.Total
                };

                // 5. Save everything using repository
                return await _orderRepository.CreateOrderWithDetailsAsync(
                    participant,
                    order,
                    details,
                    samples,
                    payment,
                    sampleKits,
                    sampleTransferInfos
                );
            }
            catch (Exception)
            {
                throw; // báo lỗi lên Controller
            }
        }


        public async Task<OrderDetailHistoryDTO?> GetOrderDetailByIdAsync(int orderId, int userId)
        {
            return await _orderRepository.GetOrderDetailByIdAsync(orderId, userId);
        }
    }
}
