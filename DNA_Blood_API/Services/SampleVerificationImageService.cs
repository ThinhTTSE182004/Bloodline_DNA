using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;

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

        public SampleVerificationImageService(ISampleService sampleService, ISampleVerificationImageRepository repository)
        {
            _sampleService = sampleService;
            _repository = repository;
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
    }
}
