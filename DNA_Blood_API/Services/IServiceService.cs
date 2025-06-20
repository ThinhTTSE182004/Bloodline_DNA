using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync();
    }
} 