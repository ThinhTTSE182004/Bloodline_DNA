namespace DNA_API1.Services
{
    public interface ISampleTransferService
    {
        Task<bool> CreateSampleTransferAsync(int sampleId);
    }
}
