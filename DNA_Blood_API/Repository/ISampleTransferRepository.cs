using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface ISampleTransferRepository
    {
        Task CreateSampleTransferAsync(SampleTransfer sampleTransfer);
    }

}
