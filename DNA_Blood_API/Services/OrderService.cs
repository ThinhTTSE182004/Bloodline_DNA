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

        public OrderService(
            IOrderRepository orderRepository,
            IStaffAssignmentService staffAssignmentService)
        {
            _orderRepository = orderRepository;
            _staffAssignmentService = staffAssignmentService;
        }

        public async Task<int> CreateOrderWithPaymentAsync(CreateOrderWithPaymentDTO dto)
        {
            // Validate test type by name
            var testType = await _orderRepository.GetTestTypeByNameAsync(dto.TestTypeName);
            if (testType == null)
            {
                throw new Exception($"Test type '{dto.TestTypeName}' not found");
            }

            // Validate sample type by name
            var sampleType = await _orderRepository.GetSampleTypeByNameAsync(dto.SampleTypeName);
            if (sampleType == null)
            {
                throw new Exception($"Sample type '{dto.SampleTypeName}' not found");
            }

            // Validate collection method by name
            var collectionMethod = await _orderRepository.GetCollectionMethodByNameAsync(dto.MethodTypeName);
            if (collectionMethod == null)
            {
                throw new Exception($"Collection method '{dto.MethodTypeName}' not found");
            }

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
                    OrderStatus = "Pending",  // Set mặc định là Pending
                    CreateAt = DateTime.Now
                };

                // 3. Create order details and samples
                var details = new List<OrderDetail>();
                var samples = new List<Sample>();

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
                    payment);
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
