using DNA_API1.Models;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface IFeedbackService
    {
        Task<Feedback?> GetByOrderIdAsync(int orderId);
        Task<bool> ExistsByOrderIdAsync(int orderId);
        Task<Feedback> AddAsync(Feedback feedback);
        Task<List<Feedback>> GetAllAsync();
        Task<List<DNA_API1.ViewModels.FeedbackDTO>> GetAllWithResponsesAsync();
    }
} 