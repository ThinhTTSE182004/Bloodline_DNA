using DNA_API1.Repository;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _serviceRepository;

        public ServiceService(IServiceRepository serviceRepository)
        {
            _serviceRepository = serviceRepository;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync()
        {
            return await _serviceRepository.GetAllServicesWithPriceAsync();
        }
    }
} 