using DNA_API1.Models;
using DNA_API1.Repository;
using Microsoft.EntityFrameworkCore;

public class SampleTransferRepository : ISampleTransferRepository
{
    private readonly BloodlineDnaContext _context;

    public SampleTransferRepository(BloodlineDnaContext context)
    {
        _context = context;
    }

    public async Task<(int sampleId, int staffId, int medicalStaffId)?> GetSampleTransferMappingAsync(int sampleId)
    {
        var sample = await _context.Samples
            .Include(s => s.OrderDetail)
            .FirstOrDefaultAsync(s => s.SampleId == sampleId);

        if (sample == null || sample.OrderDetail == null)
            return null;

        return (sample.SampleId, sample.StaffId, sample.OrderDetail.MedicalStaffId);
    }

    public async Task<bool> CreateSampleTransferAsync(int sampleId)
    {
        var mapping = await GetSampleTransferMappingAsync(sampleId);
        if (mapping == null)
            return false;

        var (sampleIdVal, staffId, medicalStaffId) = mapping.Value;

        var transfer = new SampleTransfer
        {
            StaffId = staffId,
            MedicalStaffId = medicalStaffId,
            TransferDate = DateTime.UtcNow,
            SampleTransferStatus = "Pending"
        };

        _context.SampleTransfers.Add(transfer);
        await _context.SaveChangesAsync();
        return true;
    }
}
