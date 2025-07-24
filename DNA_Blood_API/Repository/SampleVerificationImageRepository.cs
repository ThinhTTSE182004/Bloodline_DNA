using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class SampleVerificationImageRepository : ISampleVerificationImageRepository
    {
        private readonly BloodlineDnaContext _context;

        public SampleVerificationImageRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task AddAsync(SampleVerificationImage entity)
        {
            _context.SampleVerificationImages.Add(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<SampleVerificationImage>> GetBySampleIdAsync(int sampleId)
        {
            return await _context.SampleVerificationImages
                .Where(x => x.SampleId == sampleId)
                .ToListAsync();
        }

        public async Task<IEnumerable<SampleVerificationImage>> GetBySampleIdWithSampleAndParticipantAsync(int sampleId)
        {
            return await _context.SampleVerificationImages
                .Include(x => x.Sample)
                    .ThenInclude(s => s.Participant)
                .Where(x => x.SampleId == sampleId)
                .ToListAsync();
        }

        public async Task<SampleVerificationImage> GetByIdAsync(int verificationImageId)
        {
            return await _context.SampleVerificationImages
                .FirstOrDefaultAsync(x => x.VerificationImageId == verificationImageId);
        }

        public async Task UpdateAsync(SampleVerificationImage entity)
        {
            _context.SampleVerificationImages.Update(entity);
            await _context.SaveChangesAsync();
        }
    }
}
