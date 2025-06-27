using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public class FeedbackRepository : IFeedbackRepository
    {
        private readonly BloodlineDnaContext _context;
        public FeedbackRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<Feedback?> GetByOrderIdAsync(int orderId)
        {
            return await _context.Feedbacks.FirstOrDefaultAsync(f => f.OrderId == orderId);
        }

        public async Task<bool> ExistsByOrderIdAsync(int orderId)
        {
            return await _context.Feedbacks.AnyAsync(f => f.OrderId == orderId);
        }

        public async Task<Feedback> AddAsync(Feedback feedback)
        {
            await _context.Feedbacks.AddAsync(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<List<Feedback>> GetAllAsync()
        {
            return await _context.Feedbacks.ToListAsync();
        }

        public async Task<List<DNA_API1.ViewModels.FeedbackDTO>> GetAllWithResponsesAsync()
        {
            return await _context.Feedbacks
                .Select(f => new DNA_API1.ViewModels.FeedbackDTO
                {
                    FeedbackId = f.FeedbackId,
                    OrderId = f.OrderId,
                    Name = f.Name,
                    Rating = f.Rating,
                    Comment = f.Comment,
                    CreateAt = f.CreateAt,
                    ContentResponses = f.FeedbackResponses.Select(r => r.ContentResponse).ToList()
                })
                .ToListAsync();
        }
    }
} 