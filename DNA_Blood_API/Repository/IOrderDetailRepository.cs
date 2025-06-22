using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface IOrderDetailRepository
    {
        Task<bool> UpdateStatusAsync(int orderDetailId, string status);

        Task<IEnumerable<OrderDetail>> GetOrderDetailsByMedicalStaffIdAsync(int medicalStaffId);
    }
}
