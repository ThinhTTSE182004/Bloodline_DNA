using DNA_API1.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface IOrderDetailService
    {
        Task<bool> UpdateOrderDetailStatusIfAllSamplesCompletedAsync(int orderDetailId);
        Task<IEnumerable<MedicalStaffOrderDetailDTO>> GetOrderDetailsByMedicalStaffIdAsync(int medicalStaffId);

        Task<List<OrderDetailAssignedDTO>> GetOrderDetailsByStaffIdAsync(int staffId);
    }
}
