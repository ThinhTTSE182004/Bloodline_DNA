using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public class FeedbackResponseRepository : IFeedbackResponseRepository
    {
        private readonly BloodlineDnaContext _context;
        public FeedbackResponseRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<FeedbackResponse> AddAsync(FeedbackResponse response)
        {
            await _context.FeedbackResponses.AddAsync(response);
            await _context.SaveChangesAsync();
            return response;
        }

        public async Task<FeedbackResponse?> GetByIdAsync(int responseId)
        {
            return await _context.FeedbackResponses.FirstOrDefaultAsync(r => r.ResponseId == responseId);
        }

        public async Task<List<FeedbackResponse>> GetByFeedbackIdAsync(int feedbackId)
        {
            return await _context.FeedbackResponses.Where(r => r.FeedbackId == feedbackId).ToListAsync();
        }

        public async Task<List<string>> GetContentsByFeedbackIdAsync(int feedbackId)
        {
            return await _context.FeedbackResponses
                .Where(r => r.FeedbackId == feedbackId)
                .Select(r => r.ContentResponse)
                .ToListAsync();
        }

        public async Task<List<string>> GetContentsByFeedbackIdAndUserIdAsync(int feedbackId, int userId)
        {
            return await _context.FeedbackResponses
                .Where(r => r.FeedbackId == feedbackId && r.Feedback.Order.CustomerId == userId)
                .Select(r => r.ContentResponse)
                .ToListAsync();
        }
    }
} 