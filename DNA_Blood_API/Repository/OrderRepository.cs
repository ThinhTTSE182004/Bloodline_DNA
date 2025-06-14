using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly BloodlineDnaContext _context;

        public OrderRepository(BloodlineDnaContext context)
        {
            _context = context;
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
                // 1. Add participant
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
                    _context.Samples.Add(sample);
                }

                // 4. Add payment
                payment.OrderId = order.OrderId;  // Gán OrderId cho Payment
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