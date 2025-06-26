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
        private readonly IEmailService _emailService;

        public ResultService(IResultRepository resultRepository, BloodlineDnaContext context, IEmailService emailService)
        {
            _resultRepository = resultRepository;
            _context = context;
            _emailService = emailService;
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

        public async Task<List<ResultDetailDTO>> GetResultDetailsByUserIdAsync(int userId)
        {
            var results = await _resultRepository.GetResultsByUserIdAsync(userId);
            var resultDTOs = results.Select(r => new ResultDetailDTO
            {
                ResultId = r.ResultId,
                OrderDetailId = r.OrderDetailId,
                TestName = r.OrderDetail.ServicePackage.ServiceName,
                ReportDate = r.ReportDate,
                TestSummary = r.TestSummary,
                RawDataPath = r.RawDataPath,
                ReportUrl = r.ReportUrl,
                ResultStatus = r.ResultStatus,
                CreateAt = r.CreateAt,
                Samples = r.OrderDetail.Samples.Select(s => new SampleInfoDTO
                {
                    SampleId = s.SampleId,
                    SampleStatus = s.SampleStatus,
                    SampleName = s.SampleType.Name
                }).ToList()
            }).ToList();
            return resultDTOs;
        }

        public async Task ShareResultByEmailAsync(int userId, ShareResultRequestDTO request)
        {
            // Lấy kết quả và kiểm tra quyền truy cập
            var result = await _resultRepository.GetResultByIdAsync(request.ResultId);
            if (result == null)
                throw new Exception("Kết quả không tồn tại.");
            if (result.OrderDetail.Order.CustomerId != userId)
                throw new Exception("Bạn không có quyền chia sẻ kết quả này.");

            // Lấy thông tin file/report
            var testName = result.OrderDetail.ServicePackage.ServiceName;
            var reportUrl = result.ReportUrl;
            var subject = $"Chia sẻ kết quả xét nghiệm: {testName}";
            var body = $"<p>Bạn nhận được kết quả xét nghiệm từ hệ thống DNA Testing.</p>" +
                       $"<p>Tên xét nghiệm: <b>{testName}</b></p>" +
                       (string.IsNullOrEmpty(reportUrl)
                            ? "<p>Không có file kết quả đính kèm.</p>"
                            : $"<p>Bạn có thể xem kết quả tại: <a href='{reportUrl}'>{reportUrl}</a></p>");

            await _emailService.SendEmailAsync(request.ToEmail, subject, body);
        }
    }
}
