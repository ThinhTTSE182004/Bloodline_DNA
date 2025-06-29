using System.Threading.Tasks;
using DNA_Blood_API.ViewModels;

namespace DNA_Blood_API.Services
{
    public interface IAdminDashboardService
    {
        Task<AdminDashboardResultDTO> GetDashboardAsync(AdminDashboardFilterDTO filter);
    }
} 