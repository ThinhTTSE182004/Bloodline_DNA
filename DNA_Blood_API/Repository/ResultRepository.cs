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

        public async Task<Result> AddResultAsync(CreateResultWithLocusDTO resultDto)
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

        public async Task<List<Result>> GetResultsByUserIdAsync(int userId)
        {
            return await _context.Results
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.ServicePackage)
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Samples)
                        .ThenInclude(s => s.SampleType)
                .Where(r => r.OrderDetail.Order.OrderStatus != null && r.OrderDetail.Order.CustomerId == userId)
                .ToListAsync();
        }



        public async Task<Result?> GetResultWithFullDataAsync(int resultId, int userId)
        {
            return await _context.Results
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Order)
                        .ThenInclude(o => o.Customer)
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.ServicePackage)
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Samples)
                        .ThenInclude(s => s.Participant)
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Samples)
                        .ThenInclude(s => s.SampleType)
                .Include(r => r.OrderDetail)
                    .ThenInclude(od => od.Order)
                        .ThenInclude(o => o.OrderDetails)
                            .ThenInclude(od => od.Samples)
                                .ThenInclude(s => s.Participant)
                .Include(r => r.TestLocusResults)
                    .ThenInclude(tlr => tlr.Locus)
                .Where(r => r.ResultId == resultId && r.OrderDetail.Order.CustomerId == userId)
                .FirstOrDefaultAsync();
        }
    }
}
