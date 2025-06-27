using System.Threading.Tasks;
using DNA_Blood_API.ViewModels;
using DNA_Blood_API.Repository;

namespace DNA_Blood_API.Services
{
    public class AdminDashboardService : IAdminDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;
        public AdminDashboardService(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<AdminDashboardResultDTO> GetDashboardAsync(AdminDashboardFilterDTO filter)
        {
            return await _dashboardRepository.GetDashboardStatsAsync(filter.FromDate, filter.ToDate);
        }
    }
} 