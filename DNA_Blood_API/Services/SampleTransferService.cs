using DNA_API1.Models;
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

        public async Task<bool> CreateSampleTransferAsync(SampleTransfer transfer)
        {
            await _repository.CreateSampleTransferAsync(transfer);
            return true;
        }
    }

}
