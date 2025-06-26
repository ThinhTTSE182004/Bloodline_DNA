using DNA_API1.Models;
using DNA_API1.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceDTO>> GetAllServicesWithPriceAsync();
        Task<ServiceAddResultDTO> AddServiceAsync(CreateServiceDTO dto);
        Task<ServiceAddResultDTO> UpdateServiceAsync(int id, UpdateServiceDTO dto);
        Task<bool> DeleteServiceAsync(int id);
        Task<ServicePriceResultDTO> UpdateServicePriceAsync(int servicePackageId, int price);
    }
} 