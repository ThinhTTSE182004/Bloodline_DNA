using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class OrderDetailRepository: IOrderDetailRepository
    {
        private readonly BloodlineDnaContext _context;

        public OrderDetailRepository(BloodlineDnaContext context)
        {
            _context = context;
        }
        public async Task<bool> UpdateStatusAsync(int orderDetailId, string status)
        {
            var orderDetail = await _context.OrderDetails.FindAsync(orderDetailId);
            if (orderDetail == null) return false;
            orderDetail.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<OrderDetail>> GetOrderDetailsByMedicalStaffIdAsync(int medicalStaffId)
        {
            return await _context.OrderDetails
                .Where(od => od.MedicalStaffId == medicalStaffId)
                .Include(od => od.Order)
                    .ThenInclude(o => o.Customer) // Lấy thông tin khách hàng
                .Include(od => od.ServicePackage) // Lấy thông tin gói dịch vụ
                .ToListAsync();
        }
    }
}
