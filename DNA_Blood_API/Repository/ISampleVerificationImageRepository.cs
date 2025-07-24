using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface ISampleVerificationImageRepository
    {
        Task AddAsync(SampleVerificationImage entity);
        Task<IEnumerable<SampleVerificationImage>> GetBySampleIdAsync(int sampleId);

        Task<IEnumerable<SampleVerificationImage>> GetBySampleIdWithSampleAndParticipantAsync(int sampleId);


        Task<SampleVerificationImage> GetByIdAsync(int verificationImageId);
        Task UpdateAsync(SampleVerificationImage entity);
    }
}
