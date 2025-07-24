using DNA_API1.Models;
using DNA_API1.ViewModels;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public interface ISampleTransferRepository
    {
        Task CreateSampleTransferAsync(SampleTransfer sampleTransfer);
        Task<StatusChangeResult> UpdateSampleTransferStatusAsync(int transferId, string newStatus);

        Task<List<SampleTransferDTO>> GetSampleTransfersByStaffIdAsync(int staffId);
        Task<List<SampleTransferDTO>> GetSampleTransfersByMedicalStaffIdAsync(int medicalStaffId);

        Task<bool> IsSampleAssignedToMedicalStaffAsync(int sampleId, int medicalStaffId);

        Task<int?> GetSampleIdByTransferIdAsync(int transferId);
    }
}
