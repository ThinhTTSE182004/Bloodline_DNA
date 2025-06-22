using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class OrderRepository : RepositoryBase<Order>, IOrderRepository
    {
        public OrderRepository(BloodlineDnaContext context) : base(context) { }

        public async Task<List<Order>> GetOrdersWithNavigationAsync()
        {
            return await _context.Orders
                .Include(o => o.Payment)
                .Include(o => o.CollectionMethod)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ServicePackage)
                .ToListAsync();
        }

        public async Task<List<OrderHistoryDTO>> GetOrderHistoryByUserIdAsync(int userId)
        {
            return await _context.Orders
                .Where(o => o.CustomerId == userId)
                .Select(o => new OrderHistoryDTO
                {
                    OrderId = o.OrderId,
                    ServiceName = o.OrderDetails.FirstOrDefault().ServicePackage.ServiceName,
                    OrderDate = o.CreateAt ?? DateTime.Now,
                    OrderStatus = o.OrderStatus,
                    TotalAmount = o.Payment.Total,
                    PaymentMethod = o.Payment.PaymentMethod,
                    SampleCollectionMethod = o.CollectionMethod.MethodName,
                    PaymentStatus = o.Payment.PaymentStatus
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsByOrderIdAsync(int orderId, int userId)
        {
            // 1. Query để lấy toàn bộ đơn hàng (Code này của bạn đã đúng)
            var order = await _context.Orders
                .Include(o => o.OrderDetails).ThenInclude(od => od.ServicePackage).ThenInclude(sp => sp.ServicePrices)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Samples).ThenInclude(s => s.Participant)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Samples).ThenInclude(s => s.SampleType)
                .Include(o => o.Payment)
                .Include(o => o.CollectionMethod).ThenInclude(cm => cm.TestType)
                .Include(o => o.Delivery)
                .Include(o => o.OrderDetails).ThenInclude(od => od.Result)
                .Include(o => o.OrderDetails).ThenInclude(od => od.DeliveryTasks).ThenInclude(dt => dt.Staff)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == userId);

            if (order == null)
            {
                return new List<OrderDetailHistoryDTO>();
            }

            // 2. Dùng .Select() để biến đổi TỪNG `OrderDetail` thành một DTO
            var resultDtos = order.OrderDetails.Select(orderDetail => {
                // Lấy thông tin phụ cho mỗi chi tiết
                var sample = orderDetail.Samples.FirstOrDefault();
                var result = orderDetail.Result;
                var servicePrice = orderDetail.ServicePackage?.ServicePrices.FirstOrDefault();
                var testType = order.CollectionMethod?.TestType?.Name ?? "Chưa xác định";
                var deliveryTask = orderDetail.DeliveryTasks.FirstOrDefault();

                // Tạo DTO ban đầu
                var dto = new OrderDetailHistoryDTO
                {
                    OrderId = order.OrderId,
                    CreateAt = order.CreateAt,
                    OrderStatus = order.OrderStatus,
                    ServiceName = orderDetail.ServicePackage?.ServiceName ?? "Chưa xác định",
                    TestType = testType,
                    SampleType = sample?.SampleType?.Name,
                    Price = servicePrice?.Price ?? 0,
                    ParticipantName = sample?.Participant?.FullName,
                    Sex = sample?.Participant?.Sex,
                    BirthYear = sample?.Participant?.BirthDate.Year,
                    Relationship = sample?.Participant?.Relationship,
                    NameRelation = sample?.Participant?.NameRelation,
                    CollectionMethod = order.CollectionMethod?.MethodName ?? "Chưa xác định",
                    CollectedDate = sample?.CollectedDate,
                    ReceivedDate = sample?.ReceivedDate,
                    SampleStatus = sample?.SampleStatus,
                    PaymentMethod = order.Payment?.PaymentMethod,
                    PaymentStatus = order.Payment?.PaymentStatus,
                    PaymentDate = order.Payment?.PaymentDate,
                    Total = servicePrice?.Price ?? 0,
                    DeliveryAddress = order.Delivery?.DeliveryAddress,
                    DeliveryStatus = order.Delivery?.DeliveryStatus,
                    DeliveryDate = order.Delivery?.DeliveryDate,
                    DeliveryNote = order.Delivery?.Note,
                    AssignedStaffId = deliveryTask?.StaffId,
                    AssignedStaffName = deliveryTask?.Staff?.Name,
                    TaskAssignedAt = deliveryTask?.AssignedAt,
                    DeliveryTaskStatus = deliveryTask?.DeliveryTaskStatus,
                    DeliveryTaskNote = deliveryTask?.Note,
                    TaskCompleteAt = deliveryTask?.CompleteAt,
                    ResultStatus = result?.ResultStatus,
                    ResultFileUrl = result?.ReportUrl
                };

                // --- ⭐ ÁP DỤNG BUSINESS LOGIC CỦA BẠN VÀO ĐÂY ⭐ ---
                if (!testType.ToLower().Contains("civil"))
                {
                    if (string.IsNullOrEmpty(dto.ParticipantName) || string.IsNullOrEmpty(dto.NameRelation))
                    {
                        // Thay vì throw exception làm sập cả request, ta có thể thêm 1 trường báo lỗi
                        // dto.ErrorMessage = "Thiếu thông tin người thân cho xét nghiệm pháp lý";
                    }
                }
                if (!(dto.CollectionMethod ?? "").ToLower().Contains("at home"))
                {
                    dto.DeliveryAddress = null;
                    dto.DeliveryStatus = null;
                    dto.DeliveryDate = null;
                    dto.DeliveryNote = null;
                    dto.AssignedStaffId = null;
                    dto.AssignedStaffName = null;
                    dto.TaskAssignedAt = null;
                    dto.DeliveryTaskStatus = null;
                    dto.DeliveryTaskNote = null;
                    dto.TaskCompleteAt = null;
                }

                return dto; // Trả về DTO đã được xử lý
            }).ToList();

            return resultDtos;
        }

        public async Task<TestType> GetTestTypeByNameAsync(string name)
        {
            return await _context.TestTypes
                .FirstOrDefaultAsync(t => t.Name == name);
        }

        public async Task<SampleType> GetSampleTypeByNameAsync(string name)
        {
            return await _context.SampleTypes
                .FirstOrDefaultAsync(s => s.Name == name);
        }

        public async Task<CollectionMethod> GetCollectionMethodByNameAsync(string name)
        {
            return await _context.CollectionMethods
                .FirstOrDefaultAsync(cm => cm.MethodName == name);
        }

        public async Task<int> CreateOrderWithDetailsAsync(
     Participant participant,
     Order order,
     List<OrderDetail> details,
     List<Sample> samples,
     Payment payment,
     List<SampleKit> sampleKits,
     List<(int StaffId, int MedicalStaffId)> sampleTransferInfos,
     Delivery? delivery = null,
     List<DeliveryTask>? deliveryTasks = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Participants.Add(participant);
                await _context.SaveChangesAsync();

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                for (int i = 0; i < details.Count; i++)
                {
                    var detail = details[i];
                    detail.OrderId = order.OrderId;
                    _context.OrderDetails.Add(detail);
                    await _context.SaveChangesAsync();

                    var sample = samples[i];
                    sample.OrderDetailId = detail.OrderDetailId;
                    sample.ParticipantId = participant.ParticipantId;
                    _context.Samples.Add(sample);
                    await _context.SaveChangesAsync(); // Lưu để có SampleId

                    // Tạo SampleTransfer tương ứng
                    var (staffId, medicalStaffId) = sampleTransferInfos[i];
                    var transfer = new SampleTransfer
                    {
                        SampleId = sample.SampleId, // Bây giờ sample đã có SampleId
                        StaffId = staffId,
                        MedicalStaffId = medicalStaffId,
                        TransferDate = DateTime.Now,
                        SampleTransferStatus = "Pending",
                    };
                    _context.SampleTransfers.Add(transfer);
                    await _context.SaveChangesAsync(); // Save after each transfer creation
                }

                payment.OrderId = order.OrderId;
                _context.Payments.Add(payment);

                foreach (var kit in sampleKits)
                {
                    var matchingDetail = details.FirstOrDefault(d => d == kit.OrderDetail);
                    if (matchingDetail != null)
                    {
                        kit.OrderDetailId = matchingDetail.OrderDetailId;
                    }

                    _context.SampleKits.Add(kit);
                }

                // Tạo Delivery nếu có
                if (delivery != null)
                {
                    delivery.OrderId = order.OrderId;
                    _context.Deliveries.Add(delivery);
                }

                // Tạo DeliveryTask nếu có
                if (deliveryTasks != null)
                {
                    for (int i = 0; i < deliveryTasks.Count && i < details.Count; i++)
                    {
                        var task = deliveryTasks[i];
                        var orderDetail = details[i];
                        task.OrderDetailId = orderDetail.OrderDetailId;
                        _context.DeliveryTasks.Add(task);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return order.OrderId;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ServicePackage> GetServicePackageByIdAsync(int servicePackageId)
        {
            return await _context.ServicePackages
                .FirstOrDefaultAsync(sp => sp.ServicePackageId == servicePackageId);
        }

        public async Task<Order?> GetOrderWithNavigationByIdAsync(int orderId)
        {
            return await _context.Orders
                .Include(o => o.Payment)
                .Include(o => o.CollectionMethod)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ServicePackage)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);
        }

        public async Task UpdateOrderAsync(Order order)
        {
            _context.Orders.Update(order);
            await _context.SaveChangesAsync();
        }
    }
}
