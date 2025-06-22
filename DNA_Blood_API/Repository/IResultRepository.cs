using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IResultRepository
    {
        Task<Result> AddResultAsync(CreateResultDTO result);
        Task<bool> ExistsByOrderDetailIdAsync(int orderDetailId);
    }
}
