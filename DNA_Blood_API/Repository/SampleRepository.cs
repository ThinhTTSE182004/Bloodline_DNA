using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public class SampleRepository : ISampleRepository
    {
        private readonly BloodlineDnaContext _context;

        public SampleRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<Sample> GetSampleByIdAsync(int sampleId)
        {
            return await _context.Samples.FindAsync(sampleId);
        }

        public async Task<bool> UpdateSampleStatusAsync(Sample sample)
        {
            _context.Samples.Update(sample);
            return await _context.SaveChangesAsync() > 0;
        }
    }

}
