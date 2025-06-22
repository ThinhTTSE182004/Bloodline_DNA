using DNA_API1.Models;
using DNA_API1.ViewModels;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface ISampleTransferService
    {
        Task<bool> CreateSampleTransferAsync(SampleTransfer transfer);
        Task<bool> ConfirmSampleTransferAsync(int transferId);
        Task<bool> ConfirmSampleTransferReceivedAsync(int transferId);

        Task<List<SampleTransferDTO>> GetSampleTransfersByStaffIdAsync(int staffId);
        Task<List<SampleTransferDTO>> GetSampleTransfersByMedicalStaffIdAsync(int medicalStaffId);
    }
}
