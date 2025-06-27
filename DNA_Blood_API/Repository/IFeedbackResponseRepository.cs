using DNA_API1.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public interface IFeedbackResponseRepository
    {
        Task<FeedbackResponse> AddAsync(FeedbackResponse response);
        Task<FeedbackResponse?> GetByIdAsync(int responseId);
        Task<List<FeedbackResponse>> GetByFeedbackIdAsync(int feedbackId);
        Task<List<string>> GetContentsByFeedbackIdAsync(int feedbackId);
        Task<List<string>> GetContentsByFeedbackIdAndUserIdAsync(int feedbackId, int userId);
    }
} 