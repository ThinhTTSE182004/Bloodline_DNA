using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
   public class SampleTransferService : ISampleTransferService
    {
        private readonly ISampleTransferRepository _repository;
        private readonly ISampleVerificationImageRepository _imageRepository;

        public SampleTransferService(
            ISampleTransferRepository repository,
            ISampleVerificationImageRepository imageRepository
        )
        {
            _repository = repository;
            _imageRepository = imageRepository;
        }

        public async Task<bool> CreateSampleTransferAsync(SampleTransfer transfer)
        {
            await _repository.CreateSampleTransferAsync(transfer);
            return true;
        }

        public async Task<int?> GetSampleIdByTransferIdAsync(int transferId)
        {
            return await _repository.GetSampleIdByTransferIdAsync(transferId);
        }

        public async Task<StatusChangeResult> ConfirmSampleTransferAsync(int transferId)
        {
            return await _repository.UpdateSampleTransferStatusAsync(transferId, "Delivering Kit");
        }

        public async Task<StatusChangeResult> ConfirmSampleTransferReceivedAsync(int transferId, int medicalStaffId)
        {
            var transfer = await _repository.GetByIdAsync(transferId);
            if (transfer == null)
                return new StatusChangeResult { Success = false, Message = "Sample transfer not found." };

            if (transfer.MedicalStaffId != medicalStaffId)
                return new StatusChangeResult { Success = false, Message = "You do not have permission to validate this form.." };

            // Kiểm tra đủ 2 ảnh hợp lệ
            var images = await _imageRepository.GetAllImagesBySampleIdAsync(transfer.SampleId);
            var hasEnoughValidImages = images.Count(img => img.VerificationStatus == "Valid photo verification") >= 2;
            if (!hasEnoughValidImages)
                return new StatusChangeResult { Success = false, Message = "Not enough 2 valid verification photos confirmed." };

            transfer.SampleTransferStatus = "Received";
            await _repository.UpdateAsync(transfer);

            return new StatusChangeResult { Success = true, Message = "Sample received successfully confirmed." };
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

        public async Task<bool> IsSampleAssignedToMedicalStaff(int sampleId, int medicalStaffId)
        {
            return await _repository.IsSampleAssignedToMedicalStaffAsync(sampleId, medicalStaffId);
        }
    }
}
