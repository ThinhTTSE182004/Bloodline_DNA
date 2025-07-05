using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IResultRepository
    {
        Task<Result> AddResultAsync(CreateResultWithLocusDTO result);
        Task<bool> ExistsByOrderDetailIdAsync(int orderDetailId);
        Task<List<Result>> GetResultsByUserIdAsync(int userId);
        Task<Result?> GetResultWithFullDataAsync(int resultId, int userId);
    }
}
