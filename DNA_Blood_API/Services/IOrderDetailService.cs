using DNA_API1.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface IOrderDetailService
    {
        // Update OrderStatus khi tất cả samples hoàn thành
        Task<bool> UpdateOrderDetailStatusIfAllSamplesCompletedAsync(int orderDetailId);
        
        // Lấy OrderDetails theo MedicalStaffId với OrderStatus
        Task<IEnumerable<MedicalStaffOrderDetailDTO>> GetOrderDetailsByMedicalStaffIdAsync(int medicalStaffId);
    }
}
