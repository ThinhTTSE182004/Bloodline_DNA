using DNA_API1.Models;
using DNA_API1.Repository;

public class SampleTransferRepository : ISampleTransferRepository
{
    private readonly BloodlineDnaContext _context;

    public SampleTransferRepository(BloodlineDnaContext context)
    {
        _context = context;
    }

    public async Task CreateSampleTransferAsync(SampleTransfer sampleTransfer)
    {
        _context.SampleTransfers.Add(sampleTransfer);
        await _context.SaveChangesAsync();
    }
}

