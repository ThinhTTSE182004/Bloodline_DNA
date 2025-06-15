using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public class SampleService : ISampleService
    {
        private readonly ISampleRepository _sampleRepository;

        public SampleService(ISampleRepository sampleRepository)
        {
            _sampleRepository = sampleRepository;
        }

        public async Task<Sample?> GetSampleByIdAsync(int sampleId)
        {
            return await _sampleRepository.GetSampleByIdAsync(sampleId);
        }

        public async Task<bool> UpdateSampleStatusAsync(int sampleId, SampleUpdateViewModel updateModel)
        {
            var sample = await _sampleRepository.GetSampleByIdAsync(sampleId);
            if (sample == null) return false;

            // Cập nhật các trường nếu có dữ liệu
            if (!string.IsNullOrEmpty(updateModel.SampleStatus))
                sample.SampleStatus = updateModel.SampleStatus;

            if (updateModel.CollectedDate.HasValue)
                sample.CollectedDate = DateOnly.FromDateTime(updateModel.CollectedDate.Value);

            if (updateModel.ReceivedDate.HasValue)
                sample.ReceivedDate = DateOnly.FromDateTime(updateModel.ReceivedDate.Value);

            if (!string.IsNullOrEmpty(updateModel.Note))
                sample.Note = updateModel.Note;

            return await _sampleRepository.UpdateSampleStatusAsync(sample);
        }
    }

}
