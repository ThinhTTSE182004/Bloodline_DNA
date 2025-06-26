using DNA_API1.Models;
using DNA_API1.ViewModels;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace DNA_API1.Repository
{
    public interface IServiceRepository : IRepository<ServicePrice>
    {
        Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync();
        Task<ServicePrice> UpdateServicePriceAsync(int servicePackageId, int price);
    }
} 