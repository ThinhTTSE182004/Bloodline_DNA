using DNA_API1.Models;
using DNA_API1.ViewModels;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface ISampleTransferService
    {
        Task<bool> CreateSampleTransferAsync(SampleTransfer transfer);
        Task<StatusChangeResult> ConfirmSampleTransferAsync(int transferId);
        Task<StatusChangeResult> ConfirmSampleTransferReceivedAsync(int transferId);
        Task<StatusChangeResult> UpdateSampleTransferStatusAsync(int transferId, string newStatus);

        Task<List<SampleTransferDTO>> GetSampleTransfersByStaffIdAsync(int staffId);
        Task<List<SampleTransferDTO>> GetSampleTransfersByMedicalStaffIdAsync(int medicalStaffId);
    }
}
