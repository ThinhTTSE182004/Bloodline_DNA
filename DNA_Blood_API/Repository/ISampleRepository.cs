using DNA_API1.Models;
using DNA_API1.ViewModels;
namespace DNA_API1.Repository
{
    public interface ISampleRepository
    {
        Task<Sample> GetSampleByIdAsync(int sampleId);
        Task<bool> UpdateSampleStatusAsync(Sample sample);
        Task<List<SampleRecordDTO>> GetSamplesByStaffIdAsync(int staffId);
        Task<List<SampleRecordDTO>> GetSamplesByMedicalStaffIdAsync(int medicalStaffId);
    }

}
