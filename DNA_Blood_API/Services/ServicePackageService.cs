using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace DNA_API1.Services
{
    public class ServicePackageService : IServiceService
    {
        private readonly IServicePackageRepository _servicePackageRepo;
        private readonly IServiceRepository _serviceRepository;

        public ServicePackageService(
            IServicePackageRepository servicePackageRepo,
            IServiceRepository serviceRepository)
        {
            _servicePackageRepo = servicePackageRepo;
            _serviceRepository = serviceRepository;
        }

        // Lấy tất cả dịch vụ kèm giá
        public async Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync()
        {
            return await _serviceRepository.GetAllServicesWithPriceAsync();
        }

        // Thêm mới dịch vụ
        public async Task<ServiceAddResultDTO> AddServiceAsync(CreateServiceDTO dto)
        {
            var service = new ServicePackage
            {
                ServiceName = dto.ServiceName,
                Category = dto.Category,
                Description = dto.Description,
                Duration = dto.Duration,
                ProcessingTimeMinutes = dto.ProcessingTimeMinutes
            };
            await _servicePackageRepo.AddAsync(service);

            var price = new ServicePrice
            {
                ServicePackageId = service.ServicePackageId,
                Price = dto.Price
            };
            await _serviceRepository.AddAsync(price);

            return new ServiceAddResultDTO
            {
                ServicePackageId = service.ServicePackageId,
                ServiceName = service.ServiceName,
                Category = service.Category,
                Description = service.Description,
                Duration = service.Duration,
                ProcessingTimeMinutes = service.ProcessingTimeMinutes,
                Price = price.Price
            };
        }

        // Chỉnh sửa thông tin dịch vụ
        public async Task<ServiceAddResultDTO> UpdateServiceAsync(int id, UpdateServiceDTO dto)
        {
            var service = await _servicePackageRepo.GetByIdAsync(id);
            if (service == null) throw new System.Exception("Service not found");

            service.ServiceName = dto.ServiceName;
            service.Category = dto.Category;
            service.Description = dto.Description;
            service.Duration = dto.Duration;
            service.ProcessingTimeMinutes = dto.ProcessingTimeMinutes;

            await _servicePackageRepo.UpdateAsync(service);

            // Lấy giá hiện tại (nếu cần)
            var price = await _serviceRepository.FindAsync(p => p.ServicePackageId == id);
            var priceValue = price.FirstOrDefault()?.Price ?? 0;

            return new ServiceAddResultDTO
            {
                ServicePackageId = service.ServicePackageId,
                ServiceName = service.ServiceName,
                Category = service.Category,
                Description = service.Description,
                Duration = service.Duration,
                ProcessingTimeMinutes = service.ProcessingTimeMinutes,
                Price = priceValue
            };
        }

        // Xóa dịch vụ (và xóa luôn giá)
        public async Task<bool> DeleteServiceAsync(int id)
        {
            // Xóa giá
            var prices = await _serviceRepository.FindAsync(p => p.ServicePackageId == id);
            foreach (var price in prices)
            {
                await _serviceRepository.DeleteAsync(price.ServicePriceId);
            }
            // Xóa dịch vụ
            await _servicePackageRepo.DeleteAsync(id);
            return true;
        }

        // Cập nhật giá dịch vụ
        public async Task<ServicePriceResultDTO> UpdateServicePriceAsync(int servicePackageId, int price)
        {
            var servicePrice = await _serviceRepository.UpdateServicePriceAsync(servicePackageId, price);
            return new ServicePriceResultDTO
            {
                ServicePriceId = servicePrice.ServicePriceId,
                ServicePackageId = servicePrice.ServicePackageId,
                Price = servicePrice.Price
            };
        }
    }
} 