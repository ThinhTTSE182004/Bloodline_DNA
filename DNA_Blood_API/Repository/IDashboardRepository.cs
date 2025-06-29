using System;
using System.Threading.Tasks;
using DNA_Blood_API.ViewModels;

namespace DNA_Blood_API.Repository
{
    public interface IDashboardRepository
    {
        Task<AdminDashboardResultDTO> GetDashboardStatsAsync(DateTime? from, DateTime? to);
    }
} 