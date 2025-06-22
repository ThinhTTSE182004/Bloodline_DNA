using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class ResultRepository : IResultRepository
    {
        private readonly BloodlineDnaContext _context;
        public ResultRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<Result> AddResultAsync(CreateResultDTO resultDto)
        {
            var result = new Result
            {
                OrderDetailId = resultDto.OrderDetailId,
                ReportDate = resultDto.ReportDate,
                TestSummary = resultDto.TestSummary,
                RawDataPath = resultDto.RawDataPath,
                ReportUrl = resultDto.ReportUrl,
                ResultStatus = resultDto.ResultStatus,
                CreateAt = DateTime.Now,
                UpdateAt = DateTime.Now
            };

            _context.Results.Add(result);
            await _context.SaveChangesAsync();
            return result;
        }

        public async Task<bool> ExistsByOrderDetailIdAsync(int orderDetailId)
        {
            return await _context.Results.AnyAsync(r => r.OrderDetailId == orderDetailId);
        }
    }
}
