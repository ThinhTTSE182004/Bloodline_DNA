using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public class ServiceRepository : RepositoryBase<ServicePrice>, IServiceRepository
    {
        private readonly BloodlineDnaContext _context;

        public ServiceRepository(BloodlineDnaContext context) : base(context)
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
                        Category =package.Category,
                        Description =package.Description,
                        Price = price.Price
                    }
                )
                .ToListAsync();
        }

        // Bổ sung hàm cập nhật giá dịch vụ
        public async Task<ServicePrice> UpdateServicePriceAsync(int servicePackageId, int price)
        {
            var servicePrice = await _context.ServicePrices.FirstOrDefaultAsync(p => p.ServicePackageId == servicePackageId);
            if (servicePrice == null)
            {
                servicePrice = new ServicePrice { ServicePackageId = servicePackageId, Price = price };
                _context.ServicePrices.Add(servicePrice);
            }
            else
            {
                servicePrice.Price = price;
                _context.ServicePrices.Update(servicePrice);
            }
            await _context.SaveChangesAsync();
            return servicePrice;
        }
    }
} 