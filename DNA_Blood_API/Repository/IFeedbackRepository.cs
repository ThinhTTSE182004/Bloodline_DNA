using DNA_API1.Models;
using System.Threading.Tasks;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IFeedbackRepository
    {
        Task<Feedback?> GetByOrderIdAsync(int orderId);
        Task<bool> ExistsByOrderIdAsync(int orderId);
        Task<Feedback> AddAsync(Feedback feedback);
        Task<List<Feedback>> GetAllAsync();
        Task<List<FeedbackDTO>> GetAllWithResponsesAsync();
    }
} 