using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IResultService
    {
        Task<ResultDetailDTO> AddResultWithLocusAsync(CreateResultWithLocusDTO result);
        Task<List<ResultDetailDTO>> GetResultDetailsByUserIdAsync(int userId);
        Task ShareResultByEmailWithAttachmentAsync(int userId, ShareResultRequestDTO request);
        Task<byte[]> GeneratePdfReportAsync(int resultId, int userId);
        Task<ResultDetailDTO> GetResultByIdAsync(int resultId, int userId);
    }
}
