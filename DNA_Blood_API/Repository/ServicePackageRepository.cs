using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class ServicePackageRepository : RepositoryBase<ServicePackage>, IServicePackageRepository
    {
        public ServicePackageRepository(BloodlineDnaContext context) : base(context)
        {
        }

        public async Task<ServicePackage> GetByIdAsync(int servicePackageId)
        {
            return await _context.ServicePackages
                .Include(s => s.ServicePrices)
                .FirstOrDefaultAsync(s => s.ServicePackageId == servicePackageId);
        }
    }
} 