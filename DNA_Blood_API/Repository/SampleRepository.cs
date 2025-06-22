using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;
using DNA_API1.ViewModels;
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

        public async Task<List<SampleRecordDTO>> GetSamplesByStaffIdAsync(int staffId)
        {
            var samples = await _context.Samples
                .Where(s => s.StaffId == staffId)
                .Select(s => new SampleRecordDTO
                {
                    SampleId = s.SampleId,
                    SampleTypeName = s.SampleType.Name,
                    KitCodes = s.OrderDetail.SampleKits.Select(k => k.KitCode).ToList(),
                    SampleStatus = s.SampleStatus
                })
                .ToListAsync();
            return samples;
        }

        public async Task<List<SampleRecordDTO>> GetSamplesByMedicalStaffIdAsync(int medicalStaffId)
        {
            return await _context.Samples
                .Where(s => s.OrderDetail.MedicalStaffId == medicalStaffId)
                .Select(s => new SampleRecordDTO
                {
                    SampleId = s.SampleId,
                    SampleTypeName = s.SampleType.Name,
                    KitCodes = s.OrderDetail.SampleKits.Select(k => k.KitCode).ToList(),
                    SampleStatus = s.SampleStatus
                })
                .ToListAsync();
        }
    }
}
