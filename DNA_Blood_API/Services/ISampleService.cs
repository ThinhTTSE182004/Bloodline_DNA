using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface ISampleService
    {
        Task<Sample?> GetSampleByIdAsync(int sampleId);
        Task<bool> UpdateSampleStatusAsync(int sampleId, SampleUpdateViewModel updateModel);
    }
}
