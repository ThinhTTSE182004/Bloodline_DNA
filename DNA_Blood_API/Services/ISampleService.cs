using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface ISampleService
    {
        Task<Sample?> GetSampleByIdAsync(int sampleId);
        Task<bool> UpdateSampleStatusStaffAsync(int sampleId, SampleUpdateStaff updateModel);

        Task<bool> UpdateSampleStatusMedicalAsync(int sampleId, SampleUpdateMedical updateModel);

        Task<List<SampleRecordDTO>> GetSamplesByMedicalStaffIdAsync(int medicalStaffId);
        Task<List<SampleRecordDTO>> GetSamplesByStaffIdAsync(int staffId);
    }
}
