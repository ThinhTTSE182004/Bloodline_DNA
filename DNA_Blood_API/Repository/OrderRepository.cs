using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class OrderRepository : RepositoryBase<Order>, IOrderRepository
    {
        public OrderRepository(BloodlineDnaContext context) : base(context)
        {
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
                    SampleCollectionMethod = o.CollectionMethod.MethodName
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

            return new OrderDetailHistoryDTO
            {
                // 1. Thông tin đơn hàng
                OrderId = order.OrderId,
                CreateAt = order.CreateAt,
                OrderStatus = order.OrderStatus,

                // 2. Thông tin dịch vụ xét nghiệm
                ServiceName = orderDetail.ServicePackage?.ServiceName ?? "Chưa xác định",
                TestType = order.CollectionMethod?.TestType?.Name ?? "Chưa xác định",
                SampleType = sample?.SampleType?.Name ?? "Chưa xác định",
                Price = servicePrice?.Price ?? 0,

                // 3. Thông tin người tham gia
                ParticipantName = sample?.Participant?.FullName ?? "Chưa xác định",
                Sex = sample?.Participant?.Sex ?? "Chưa xác định",
                BirthYear = sample?.Participant?.BirthDate.Year ?? DateTime.Now.Year,
                Relationship = sample?.Participant?.Relationship ?? "Chưa xác định",
                NameRelation = sample?.Participant?.NameRelation ?? "Chưa xác định",

                // 4. Tiến trình mẫu
                CollectionMethod = order.CollectionMethod?.MethodName ?? "Chưa xác định",
                CollectedDate = sample?.CollectedDate,
                ReceivedDate = sample?.ReceivedDate,
                SampleStatus = sample?.SampleStatus ?? "Chưa lấy mẫu",

                // 5. Thông tin thanh toán
                PaymentMethod = order.Payment?.PaymentMethod ?? "Chưa xác định",
                PaymentStatus = order.Payment?.PaymentStatus ?? "Chưa xác định",
                PaymentDate = order.Payment?.PaymentDate,
                Total = order.Payment?.Total ?? 0,

                // 6. Thông tin giao hàng
                DeliveryAddress = order.Delivery?.DeliveryAddress,
                DeliveryStatus = order.Delivery?.DeliveryStatus,
                DeliveryDate = order.Delivery?.DeliveryDate,
                DeliveryNote = order.Delivery?.Note,

                // 7. Kết quả xét nghiệm
                ResultStatus = result?.ResultStatus,
                ResultFileUrl = result?.ReportUrl
            };
        }

        public async Task<TestType> GetTestTypeByNameAsync(string name)
        {
            return await _context.TestTypes.FirstOrDefaultAsync(t => t.Name == name);
        }

        public async Task<SampleType> GetSampleTypeByNameAsync(string name)
        {
            return await _context.SampleTypes.FirstOrDefaultAsync(s => s.Name == name);
        }

        public async Task<CollectionMethod> GetCollectionMethodByNameAsync(string name)
        {
            return await _context.CollectionMethods.FirstOrDefaultAsync(cm => cm.MethodName == name);
        }

        public async Task<int> CreateOrderWithDetailsAsync(
            Participant participant,
            Order order,
            List<OrderDetail> details,
            List<Sample> samples,
            Payment payment)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Add participant first to get ParticipantId
                _context.Participants.Add(participant);
                await _context.SaveChangesAsync();

                // 2. Add order
                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 3. Add order details and samples
                for (int i = 0; i < details.Count; i++)
                {
                    var detail = details[i];
                    detail.OrderId = order.OrderId;
                    _context.OrderDetails.Add(detail);
                    await _context.SaveChangesAsync();

                    var sample = samples[i];
                    sample.OrderDetailId = detail.OrderDetailId;
                    sample.ParticipantId = participant.ParticipantId; // Gán ParticipantId cho sample
                    _context.Samples.Add(sample);
                }

                // 4. Add payment
                payment.OrderId = order.OrderId;
                _context.Payments.Add(payment);

                // 5. Save all changes
                await _context.SaveChangesAsync();

                // 6. Commit transaction
                await transaction.CommitAsync();

                return order.OrderId;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<User>> GetAvailableMedicalStaffAsync(string serviceName, int maxOrdersPerDay)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            // Lấy danh sách medical staff có chuyên môn phù hợp và chưa vượt quá số đơn tối đa
            return await _context.Users
                .Include(u => u.UserProfile)
                .Where(u => u.RoleId == 4 && // Giả sử role_id 4 là medical staff
                           u.UserProfile.Specialization != null &&
                           u.UserProfile.YearsOfExperience >= 2 && // Yêu cầu ít nhất 2 năm kinh nghiệm
                           serviceName.Contains(u.UserProfile.Specialization)) // So sánh ngược lại
                .Select(u => new
                {
                    User = u,
                    OrderCount = _context.OrderDetails
                        .Where(od => od.MedicalStaffId == u.UserId &&
                                   od.Order.CreateAt >= today &&
                                   od.Order.CreateAt < tomorrow)
                        .Count()
                })
                .Where(x => x.OrderCount < maxOrdersPerDay)
                .OrderBy(x => x.OrderCount) // Sắp xếp theo số đơn hàng ít nhất
                .Select(x => x.User)
                .ToListAsync();
        }

        public async Task<List<User>> GetAvailableStaffAsync(int maxOrdersPerDay)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            // Lấy danh sách staff thông thường chưa vượt quá số đơn tối đa
            return await _context.Users
                .Where(u => u.RoleId == 3) // Giả sử role_id 3 là staff thông thường
                .Select(u => new
                {
                    User = u,
                    OrderCount = _context.Samples
                        .Where(s => s.StaffId == u.UserId &&
                                  s.OrderDetail.Order.CreateAt >= today &&
                                  s.OrderDetail.Order.CreateAt < tomorrow)
                        .Count()
                })
                .Where(x => x.OrderCount < maxOrdersPerDay)
                .OrderBy(x => x.OrderCount) // Sắp xếp theo số đơn hàng ít nhất
                .Select(x => x.User)
                .ToListAsync();
        }

        public async Task<int> GetStaffOrderCountAsync(int staffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            return await _context.Samples
                .Where(s => s.StaffId == staffId &&
                           s.OrderDetail.Order.CreateAt >= date &&
                           s.OrderDetail.Order.CreateAt < nextDay)
                .CountAsync();
        }

        public async Task<ServicePackage> GetServicePackageByIdAsync(int servicePackageId)
        {
            return await _context.ServicePackages
                .FirstOrDefaultAsync(sp => sp.ServicePackageId == servicePackageId);
        }
    }
} 