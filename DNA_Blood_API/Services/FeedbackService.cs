using DNA_API1.Models;
using DNA_API1.Repository;
using System.Threading.Tasks;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IFeedbackRepository _feedbackRepository;
        public FeedbackService(IFeedbackRepository feedbackRepository)
        {
            _feedbackRepository = feedbackRepository;
        }

        public async Task<Feedback?> GetByOrderIdAsync(int orderId)
        {
            return await _feedbackRepository.GetByOrderIdAsync(orderId);
        }

        public async Task<bool> ExistsByOrderIdAsync(int orderId)
        {
            return await _feedbackRepository.ExistsByOrderIdAsync(orderId);
        }

        public async Task<Feedback> AddAsync(Feedback feedback)
        {
            return await _feedbackRepository.AddAsync(feedback);
        }

        public async Task<List<Feedback>> GetAllAsync()
        {
            return await _feedbackRepository.GetAllAsync();
        }

        public async Task<List<FeedbackDTO>> GetAllWithResponsesAsync()
        {
            var feedbacks = await _feedbackRepository.GetAllWithResponsesAsync();
            return feedbacks;
        }
    }
} 