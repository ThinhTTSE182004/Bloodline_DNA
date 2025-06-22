using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class OrderDetailService: IOrderDetailService
    {
        private readonly BloodlineDnaContext _context;
        private readonly IOrderDetailRepository _orderDetailRepository; 

        public OrderDetailService(BloodlineDnaContext context, IOrderDetailRepository orderDetailRepository)
        {        
            _context = context;
            _orderDetailRepository = orderDetailRepository; 
        }
        public async Task<bool> UpdateOrderDetailStatusIfAllSamplesCompletedAsync(int orderDetailId)
        {
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Samples)
                .FirstOrDefaultAsync(od => od.OrderDetailId == orderDetailId);

            if (orderDetail == null) return false;

            // Nếu tất cả mẫu con đã hoàn thành
            if (orderDetail.Samples != null && orderDetail.Samples.All(s => s.SampleStatus == "Completed"))
            {
                orderDetail.Status = "Completed";
                await _context.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<IEnumerable<MedicalStaffOrderDetailDTO>> GetOrderDetailsByMedicalStaffIdAsync(int medicalStaffId)
        {
            var orderDetails = await _orderDetailRepository.GetOrderDetailsByMedicalStaffIdAsync(medicalStaffId);

            // Map sang List<MedicalStaffOrderDetailDTO>
            var dtos = orderDetails.Select(od => new MedicalStaffOrderDetailDTO
            {
                OrderDetailId = od.OrderDetailId,
                CustomerName = od.Order?.Customer?.Name,
                ServiceName = od.ServicePackage?.ServiceName,
                Status = od.Status,
                OrderDate = od.Order?.CreateAt
            });

            return dtos;
        }

        public async Task<List<OrderDetailAssignedDTO>> GetOrderDetailsByStaffIdAsync(int staffId)
        {
            var orderDetails = await _orderDetailRepository.GetOrderDetailsByStaffIdAsync(staffId);
            return orderDetails.Select(od => new OrderDetailAssignedDTO
            {
                OrderDetailId = od.OrderDetailId,
                CustomerName = od.Order.Customer.Name,
                ServiceName = od.ServicePackage.ServiceName,
                OrderDate = od.Order.CreateAt
            }).ToList();
        }
    }
}
