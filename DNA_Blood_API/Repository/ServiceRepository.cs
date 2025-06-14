using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly BloodlineDnaContext _context;

        public ServiceRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync()
        {
            return await _context.ServicePackages
                .Join(
                    _context.ServicePrices,
                    package => package.ServicePackageId,
                    price => price.ServicePackageId,
                    (package, price) => new ServiceDTO
                    {
                        ServicePackageId = package.ServicePackageId,
                        ServiceName = package.ServiceName,
                        Price = price.Price
                    }
                )
                .ToListAsync();
        }
    }
} 