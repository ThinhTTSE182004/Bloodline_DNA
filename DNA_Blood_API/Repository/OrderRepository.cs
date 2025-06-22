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

        public async Task<OrderDetailHistoryDTO?> GetOrderDetailByIdAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.ServicePackage)
                        .ThenInclude(sp => sp.ServicePrices)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Samples)
                        .ThenInclude(s => s.Participant)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Samples)
                        .ThenInclude(s => s.SampleType)
                .Include(o => o.Payment)
                .Include(o => o.CollectionMethod)
                    .ThenInclude(cm => cm.TestType)
                .Include(o => o.Delivery)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.Result)
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.CustomerId == userId);

            if (order == null) return null;

            var orderDetail = order.OrderDetails.FirstOrDefault();
            if (orderDetail == null) return null;

            var sample = orderDetail.Samples.FirstOrDefault();
            var result = orderDetail.Result;
            var servicePrice = orderDetail.ServicePackage?.ServicePrices.FirstOrDefault();
            var sampleTypeName = order.OrderDetails
                .SelectMany(od => od.Samples)
                .Select(s => s.SampleType.Name)
                .FirstOrDefault();

            return new OrderDetailHistoryDTO
            {
                OrderId = order.OrderId,
                CreateAt = order.CreateAt,
                OrderStatus = order.OrderStatus,

                ServiceName = orderDetail.ServicePackage?.ServiceName ?? "Chưa xác định",
                TestType = order.CollectionMethod?.TestType?.Name ?? "Chưa xác định",
                SampleType = sampleTypeName,
                Price = servicePrice?.Price ?? 0,

                ParticipantName = sample?.Participant?.FullName ?? "Chưa xác định",
                Sex = sample?.Participant?.Sex ?? "Chưa xác định",
                BirthYear = sample?.Participant?.BirthDate.Year ?? DateTime.Now.Year,
                Relationship = sample?.Participant?.Relationship ?? "Chưa xác định",
                NameRelation = sample?.Participant?.NameRelation ?? "Chưa xác định",

                CollectionMethod = order.CollectionMethod?.MethodName ?? "Chưa xác định",
                CollectedDate = sample?.CollectedDate,
                ReceivedDate = sample?.ReceivedDate,
                SampleStatus = sample?.SampleStatus ?? "Chưa lấy mẫu",

                PaymentMethod = order.Payment?.PaymentMethod ?? "Chưa xác định",
                PaymentStatus = order.Payment?.PaymentStatus ?? "Chưa xác định",
                PaymentDate = order.Payment?.PaymentDate,
                Total = servicePrice?.Price ?? 0,

                DeliveryAddress = order.Delivery?.DeliveryAddress,
                DeliveryStatus = order.Delivery?.DeliveryStatus,
                DeliveryDate = order.Delivery?.DeliveryDate,
                DeliveryNote = order.Delivery?.Note,

                ResultStatus = result?.ResultStatus,
                ResultFileUrl = result?.ReportUrl
            };
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
     List<(int StaffId, int MedicalStaffId)> sampleTransferInfos)
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
