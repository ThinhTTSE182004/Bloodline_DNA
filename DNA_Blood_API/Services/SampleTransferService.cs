using DNA_API1.Repository;

namespace DNA_API1.Services
{
    public class SampleTransferService : ISampleTransferService
    {
        private readonly ISampleTransferRepository _repository;

        public SampleTransferService(ISampleTransferRepository repository)
        {
            _repository = repository;
        }

        public async Task<bool> CreateSampleTransferAsync(int sampleId)
        {
            return await _repository.CreateSampleTransferAsync(sampleId);
        }
    }

}
