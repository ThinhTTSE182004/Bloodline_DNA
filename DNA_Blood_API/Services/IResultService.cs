using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IResultService
    {
        Task<ResultDTO> AddResultAsync(CreateResultDTO result);
        Task<List<ResultDetailDTO>> GetResultDetailsByUserIdAsync(int userId);
        Task ShareResultByEmailAsync(int userId, ShareResultRequestDTO request);
    }
}
