using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class UploadResult
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; }
    }

    public class SampleVerificationImageService : ISampleVerificationImageService
    {
        private readonly ISampleService _sampleService;
        private readonly ISampleVerificationImageRepository _repository;
        private readonly IUserRepository _userRepository;
        private readonly ISampleTransferService _sampleTransferService;
        private readonly ISampleVerificationImageRepository _sampleVerificationImageRepository;

        public SampleVerificationImageService(
            ISampleService sampleService,
            ISampleVerificationImageRepository repository,
            IUserRepository userRepository,
            ISampleTransferService sampleTransferService
        )
        {
            _sampleService = sampleService;
            _repository = repository;
            _userRepository = userRepository;
            _sampleTransferService = sampleTransferService;
            _sampleVerificationImageRepository = repository;
        }

        public async Task<UploadResult> UploadVerificationImageAsync(SampleVerificationImageCreateDTO model, int staffId)
        {
            var sample = await _sampleService.GetSampleByIdAsync(model.SampleId);
            if (sample == null)
                return new UploadResult { Success = false, StatusCode = 404, Message = "Sample không tồn tại." };
            if (sample.StaffId != staffId)
                return new UploadResult { Success = false, StatusCode = 403, Message = "Bạn không có quyền upload ảnh cho mẫu này." };

            var entity = new SampleVerificationImage
            {
                SampleId = model.SampleId,
                ImageUrl = model.ImageUrl,
                CaptureTime = DateTime.Now,
                CapturedBy = staffId,
                VerificationType = model.VerificationType,
                VerificationStatus = "Chờ xác minh",
                Note = model.Note
            };
            await _repository.AddAsync(entity);
            return new UploadResult { Success = true, StatusCode = 200, Message = "Upload ảnh xác minh thành công." };
        }

        public async Task<IEnumerable<SampleVerificationImage>> GetImagesBySampleIdAsync(int sampleId)
        {
            return await _repository.GetBySampleIdAsync(sampleId);
        }

        public async Task<IEnumerable<SampleVerificationImageDTO>> GetImageVMsBySampleIdAsync(int sampleId)
        {
            var images = await _repository.GetBySampleIdWithSampleAndParticipantAsync(sampleId);

            var userIds = images
                .SelectMany(img => new[] { img.CapturedBy }
                    .Concat(img.VerifiedBy.HasValue ? new[] { img.VerifiedBy.Value } : Array.Empty<int>()))
                .Distinct()
                .ToList();

            var users = await _userRepository.GetUserNamesByIdsAsync(userIds);

            return images.Select(img => new SampleVerificationImageDTO
            {
                VerificationImageId = img.VerificationImageId,
                SampleId = img.SampleId,
                ImageUrl = img.ImageUrl,
                CaptureTime = img.CaptureTime,
                CapturedBy = img.CapturedBy,
                CapturedByName = users.ContainsKey(img.CapturedBy) ? users[img.CapturedBy] : null,
                VerificationType = img.VerificationType,
                VerifiedBy = img.VerifiedBy,
                VerifiedByName = img.VerifiedBy.HasValue && users.ContainsKey(img.VerifiedBy.Value) ? users[img.VerifiedBy.Value] : null,
                VerificationStatus = img.VerificationStatus,
                Note = img.Note,
                ParticipantId = img.Sample.ParticipantId,
                ParticipantName = img.Sample.Participant?.FullName // hoặc .Name tùy model
            });
        }

        public async Task<bool> VerifyImageAsync(int verificationImageId, SampleVerificationImageVerifyDTO model, int medicalStaffId)
        {
            var image = await _repository.GetByIdAsync(verificationImageId);
            if (image == null) return false;

            var isAssigned = await _sampleTransferService.IsSampleAssignedToMedicalStaff(image.SampleId, medicalStaffId);
            if (!isAssigned) return false;

            image.VerificationStatus = model.VerificationStatus;
            image.Note = model.Note;
            image.VerifiedBy = medicalStaffId;

            await _repository.UpdateAsync(image);
            return true;
        }

        public async Task<bool> HasAtLeastTwoVerificationImagesAsync(int sampleId)
        {
            var images = await _repository.GetAllImagesBySampleIdAsync(sampleId);
            return images.Count() >= 2;
        }

        public async Task<bool> HasAtLeastTwoValidImagesAsync(int sampleId)
        {
            var images = await _repository.GetAllImagesBySampleIdAsync(sampleId);
            // Chỉ tính ảnh đã được xác nhận là "Hợp lệ"
            return images.Count(img => img.VerificationStatus == "Hợp lệ") >= 2;
        }

    }
}
