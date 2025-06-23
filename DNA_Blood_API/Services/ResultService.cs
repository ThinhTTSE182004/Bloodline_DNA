using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class ResultService : IResultService
    {
        private readonly IResultRepository _resultRepository;
        private readonly BloodlineDnaContext _context;

        public ResultService(IResultRepository resultRepository, BloodlineDnaContext context)
        {
            _resultRepository = resultRepository;
            _context = context;
        }

        public async Task<ResultDTO> AddResultAsync(CreateResultDTO result)
        {
            // Kiểm tra OrderDetail có tồn tại không
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Samples)
                .FirstOrDefaultAsync(od => od.OrderDetailId == result.OrderDetailId);

            if (orderDetail == null)
                throw new Exception("OrderDetail không tồn tại.");

            // Kiểm tra đã có Result chưa (mỗi OrderDetail chỉ có 1 Result)
            if (await _resultRepository.ExistsByOrderDetailIdAsync(result.OrderDetailId))
                throw new Exception("OrderDetail này đã có kết quả.");

            // Kiểm tra tất cả sample đã hoàn thành chưa
            if (orderDetail.Samples == null || orderDetail.Samples.Count == 0)
                throw new Exception("OrderDetail chưa có mẫu.");

            if (orderDetail.Samples.Any(s => s.SampleStatus != "Completed"))
                throw new Exception("Chưa thể nhập kết quả vì còn mẫu chưa hoàn thành.");

            // Lưu kết quả
            var createdResult = await _resultRepository.AddResultAsync(result);

            // Map sang DTO và trả về
            return new ResultDTO
            {
                ResultId = createdResult.ResultId,
                OrderDetailId = createdResult.OrderDetailId,
                ReportDate = createdResult.ReportDate,
                TestSummary = createdResult.TestSummary,
                RawDataPath = createdResult.RawDataPath,
                ReportUrl = createdResult.ReportUrl,
                ResultStatus = createdResult.ResultStatus,
                CreateAt = createdResult.CreateAt,
                UpdateAt = createdResult.UpdateAt
            };
        }
    }
}
