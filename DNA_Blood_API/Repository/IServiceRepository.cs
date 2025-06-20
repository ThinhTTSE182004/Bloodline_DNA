using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IServiceRepository
    {
        Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync();
    }
} 