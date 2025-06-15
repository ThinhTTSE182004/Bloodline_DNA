namespace DNA_API1.Repository
{
    public interface ISampleTransferRepository
    {
        Task<(int sampleId, int staffId, int medicalStaffId)?> GetSampleTransferMappingAsync(int sampleId);
        Task<bool> CreateSampleTransferAsync(int sampleId);
    }
}
