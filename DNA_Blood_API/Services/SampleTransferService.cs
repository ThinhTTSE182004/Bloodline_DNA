using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public class SampleTransferService : ISampleTransferService
    {
        private readonly ISampleTransferRepository _repository;

        public SampleTransferService(ISampleTransferRepository repository)
        {
            _repository = repository;
        }

        public async Task<bool> CreateSampleTransferAsync(SampleTransfer transfer)
        {
            await _repository.CreateSampleTransferAsync(transfer);
            return true;
        }

        public async Task<StatusChangeResult> ConfirmSampleTransferAsync(int transferId)
        {
            return await _repository.UpdateSampleTransferStatusAsync(transferId, "Delivering Kit");
        }

        public async Task<StatusChangeResult> ConfirmSampleTransferReceivedAsync(int transferId)
        {
            return await _repository.UpdateSampleTransferStatusAsync(transferId, "Received");
        }

        public async Task<List<SampleTransferDTO>> GetSampleTransfersByStaffIdAsync(int staffId)
        {
            return await _repository.GetSampleTransfersByStaffIdAsync(staffId);
        }

        public async Task<List<SampleTransferDTO>> GetSampleTransfersByMedicalStaffIdAsync(int medicalStaffId)
        {
            return await _repository.GetSampleTransfersByMedicalStaffIdAsync(medicalStaffId);
        }

        public async Task<StatusChangeResult> UpdateSampleTransferStatusAsync(int transferId, string newStatus)
        {
            return await _repository.UpdateSampleTransferStatusAsync(transferId, newStatus);
        }
    }
}
