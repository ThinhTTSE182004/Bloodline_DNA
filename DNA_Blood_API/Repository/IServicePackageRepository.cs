using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface IServicePackageRepository : IRepository<ServicePackage>
    {
        Task<ServicePackage> GetByIdAsync(int servicePackageId);
    }
} 