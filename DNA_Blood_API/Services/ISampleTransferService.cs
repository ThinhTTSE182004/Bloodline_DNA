using DNA_API1.Models;

namespace DNA_API1.Services
{
    public interface ISampleTransferService
    {
        Task<bool> CreateSampleTransferAsync(SampleTransfer transfer);
    }

}
