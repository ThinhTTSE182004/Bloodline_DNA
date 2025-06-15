using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface ISampleRepository
    {
        Task<Sample?> GetSampleByIdAsync(int sampleId);
        Task UpdateSampleAsync(Sample sample);
    }
}
