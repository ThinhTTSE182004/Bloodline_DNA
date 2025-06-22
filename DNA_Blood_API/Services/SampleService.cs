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
        // Update sample của medical staff
        public async Task<bool> UpdateSampleStatusMedicalAsync(int sampleId, SampleUpdateMedical updateModel)
        {
            var sample = await _sampleRepository.GetSampleByIdAsync(sampleId);
            if (sample == null) return false;

            // Cập nhật các trường nếu có dữ liệu
            if (!string.IsNullOrEmpty(updateModel.SampleStatus))
                sample.SampleStatus = updateModel.SampleStatus;

            if (updateModel.ReceivedDate.HasValue)
                sample.CollectedDate = DateOnly.FromDateTime(updateModel.ReceivedDate.Value);

            return await _sampleRepository.UpdateSampleStatusAsync(sample);
        }
        // Update sample củastaff
        public async Task<bool> UpdateSampleStatusStaffAsync(int sampleId, SampleUpdateStaff updateModel)
        {
            var sample = await _sampleRepository.GetSampleByIdAsync(sampleId);
            if (sample == null) return false;

            // Cập nhật các trường nếu có dữ liệu
            if (!string.IsNullOrEmpty(updateModel.SampleStatus))
                sample.SampleStatus = updateModel.SampleStatus;

            if (updateModel.CollectedDate.HasValue)
                sample.CollectedDate = DateOnly.FromDateTime(updateModel.CollectedDate.Value);

            if (!string.IsNullOrEmpty(updateModel.Note))
                sample.Note = updateModel.Note;

            return await _sampleRepository.UpdateSampleStatusAsync(sample);
        }

        public async Task<List<SampleRecordDTO>> GetSamplesByMedicalStaffIdAsync(int medicalStaffId)
        {
            // Ví dụ: Lấy các mẫu mà medicalStaffId là người phụ trách nhận mẫu (tuỳ vào nghiệp vụ)
            return await _sampleRepository.GetSamplesByMedicalStaffIdAsync(medicalStaffId);
        }



        public async Task<List<SampleRecordDTO>> GetSamplesByStaffIdAsync(int staffId)
        {
            return await _sampleRepository.GetSamplesByStaffIdAsync(staffId);
        }
    }

}
