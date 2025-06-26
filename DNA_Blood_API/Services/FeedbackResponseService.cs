using DNA_API1.Models;
using DNA_API1.Repository;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public class FeedbackResponseService : IFeedbackResponseService
    {
        private readonly IFeedbackResponseRepository _repository;
        public FeedbackResponseService(IFeedbackResponseRepository repository)
        {
            _repository = repository;
        }

        public async Task<FeedbackResponse> AddAsync(FeedbackResponse response)
        {
            return await _repository.AddAsync(response);
        }

        public async Task<FeedbackResponse?> GetByIdAsync(int responseId)
        {
            return await _repository.GetByIdAsync(responseId);
        }

        public async Task<List<FeedbackResponse>> GetByFeedbackIdAsync(int feedbackId)
        {
            return await _repository.GetByFeedbackIdAsync(feedbackId);
        }
        public async Task<List<string>> GetContentsByFeedbackIdAsync(int feedbackId)
        {
            return await _repository.GetContentsByFeedbackIdAsync(feedbackId);
        }
        public async Task<List<string>> GetContentsByFeedbackIdAndUserIdAsync(int feedbackId, int userId)
        {
            return await _repository.GetContentsByFeedbackIdAndUserIdAsync(feedbackId, userId);
        }
    }
} 