﻿using DNA_API1.Models;
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
        private readonly IStaffScheduleRepository _staffScheduleRepository;
        public OrderService(
            IOrderRepository orderRepository,
            IStaffAssignmentService staffAssignmentService,
            ISampleTransferRepository sampleTransferRepository,
            IStaffScheduleRepository staffScheduleRepository)
        {
            _orderRepository = orderRepository;
            _staffAssignmentService = staffAssignmentService;
            _sampleTransferService = sampleTransferRepository;
            _staffScheduleRepository = staffScheduleRepository;
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

            // Validate delivery address for At Home collection
            if (collectionMethod.MethodName == "At Home" && string.IsNullOrWhiteSpace(dto.DeliveryAddress))
                throw new Exception("Delivery address is required for At Home collection method");
            else if (collectionMethod.MethodName != "At Home")
            {
                // Nếu không phải At Home, không cần DeliveryAddress
                dto.DeliveryAddress = null;
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
                    OrderStatus = "Pending",
                    BookingDate = dto.BookingDate,
                    CreateAt = DateTime.Now
                };

                // 3. Create order details, samples, transfer info, sample kits
                var details = new List<OrderDetail>();
                var samples = new List<Sample>();
                var sampleKits = new List<SampleKit>();
                var sampleTransferInfos = new List<(int, int)>();
                var deliveryTasks = new List<DeliveryTask>();

                foreach (var detailDto in dto.Details)
                {
                    // Lấy service package để lấy thông tin thời gian xử lý
                    // (Giả sử _orderRepository có hàm lấy ServicePackage theo Id, nếu chưa có thì cần bổ sung)
                    var servicePackage = await _orderRepository.GetServicePackageByIdAsync(detailDto.ServicePackageId);
                    if (servicePackage == null)
                        throw new Exception($"Service package id '{detailDto.ServicePackageId}' not found");

                    var serviceName = servicePackage.ServiceName;
                    var medicalProcessingTime = servicePackage.ProcessingTimeMinutes;
                    var staffProcessingTime = _staffScheduleRepository.CalculateStaffProcessingTime(serviceName);
                    var bookingDate = dto.BookingDate ?? DateTime.Now;
                    // Tự động phân công staff
                    var (medicalStaffId, staffId) = await _staffAssignmentService.AutoAssignStaffAndMedicalForOrderAsync(
                        bookingDate,
                        serviceName,
                        medicalProcessingTime,
                        staffProcessingTime
                    );

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

                    // Tạo DeliveryTask cho mỗi order detail chỉ khi là At Home
                    if (collectionMethod.MethodName == "At Home")
                    {
                        var deliveryTask = new DeliveryTask
                        {
                            ManagerId = 1, // Admin mặc định
                            StaffId = staffId,
                            AssignedAt = DateTime.Now,
                            DeliveryTaskStatus = "Assigned",
                            Note = $"Tự động phân công cho dịch vụ {detailDto.ServicePackageId}"
                        };
                        deliveryTasks.Add(deliveryTask);
                    }

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

                // 5. Tạo Delivery nếu là At Home collection
                Delivery? delivery = null;
                if (collectionMethod.MethodName == "At Home")
                {
                    delivery = new Delivery
                    {
                        DeliveryAddress = dto.DeliveryAddress ?? "",
                        DeliveryStatus = "Pending",
                        DeliveryDate = DateOnly.FromDateTime(dto.BookingDate ?? DateTime.Today),
                        Note = $"Giao hàng tại nhà"
                    };
                }

                // 6. Save everything using repository
                var orderId = await _orderRepository.CreateOrderWithDetailsAsync(
                    participant,
                    order,
                    details,
                    samples,
                    payment,
                    sampleKits,
                    sampleTransferInfos,
                    delivery,
                    collectionMethod.MethodName == "At Home" ? deliveryTasks : null
                );

                // 7. Create sample transfers after samples are saved
                foreach (var (staffId, medicalStaffId) in sampleTransferInfos)
                {
                    var sample = samples[sampleTransferInfos.IndexOf((staffId, medicalStaffId))];
                    var sampleTransfer = new SampleTransfer
                    {
                        SampleId = sample.SampleId,
                        StaffId = staffId,
                        MedicalStaffId = medicalStaffId,
                        TransferDate = DateTime.Now,
                        SampleTransferStatus = "Pending"
                    };
                    await _sampleTransferService.CreateSampleTransferAsync(sampleTransfer);
                }

                return orderId;
            }
            catch (Exception)
            {
                throw; // báo lỗi lên Controller
            }
        }


        public async Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsAsync(int orderId, int userId)
        {
            return await _orderRepository.GetOrderDetailsByOrderIdAsync(orderId, userId);
        }
    }
}
