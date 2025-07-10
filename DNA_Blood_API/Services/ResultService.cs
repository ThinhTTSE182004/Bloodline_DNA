using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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



        public async Task<ResultDetailDTO> AddResultWithLocusAsync(CreateResultWithLocusDTO result)
        {
            // Kiểm tra OrderDetail có tồn tại không
            var orderDetail = await _context.OrderDetails
                .Include(od => od.Samples)
                    .ThenInclude(s => s.SampleType)
                .Include(od => od.ServicePackage)
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

            var createdResult = await _resultRepository.AddResultAsync(result);

            // Lưu TestLocusResult
            foreach (var locusResult in result.LocusResults)
            {
                var testLocusResult = new TestLocusResult
                {
                    ResultId = createdResult.ResultId,
                    LocusId = locusResult.LocusId,
                    PersonAAlleles = locusResult.PersonAAlleles,
                    PersonBAlleles = locusResult.PersonBAlleles,
                    IsMatch = locusResult.IsMatch
                };

                _context.TestLocusResults.Add(testLocusResult);
            }

            await _context.SaveChangesAsync();

            // Map sang DTO và trả về
            return new ResultDetailDTO
            {
                ResultId = createdResult.ResultId,
                OrderDetailId = createdResult.OrderDetailId,
                TestName = orderDetail.ServicePackage?.ServiceName ?? "Unknown Service",
                ReportDate = createdResult.ReportDate,
                TestSummary = createdResult.TestSummary,
                RawDataPath = createdResult.RawDataPath,
                ReportUrl = createdResult.ReportUrl,
                ResultStatus = createdResult.ResultStatus,
                CreateAt = createdResult.CreateAt,
                Samples = orderDetail.Samples?.Select(s => new SampleInfoDTO
                {
                    SampleId = s.SampleId,
                    SampleStatus = s.SampleStatus,
                    SampleName = s.SampleType?.Name ?? "Unknown Type"
                }).ToList() ?? new List<SampleInfoDTO>()
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
            var result = await _resultRepository.GetResultWithFullDataAsync(request.ResultId, userId);
            if (result == null)
                throw new Exception("Kết quả không tồn tại hoặc bạn không có quyền truy cập.");

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

        public async Task<ResultDetailDTO> GetResultByIdAsync(int resultId, int userId)
        {
            var result = await _resultRepository.GetResultWithFullDataAsync(resultId, userId);
            if (result == null)
                return null;

            return new ResultDetailDTO
            {
                ResultId = result.ResultId,
                OrderDetailId = result.OrderDetailId,
                TestName = result.OrderDetail.ServicePackage.ServiceName,
                ReportDate = result.ReportDate,
                TestSummary = result.TestSummary,
                RawDataPath = result.RawDataPath,
                ReportUrl = result.ReportUrl,
                ResultStatus = result.ResultStatus,
                CreateAt = result.CreateAt,
                Samples = result.OrderDetail.Samples.Select(s => new SampleInfoDTO
                {
                    SampleId = s.SampleId,
                    SampleStatus = s.SampleStatus,
                    SampleName = s.SampleType.Name
                }).ToList()
            };
        }

        public async Task<byte[]> GeneratePdfReportAsync(int resultId, int userId)
        {
            var result = await _resultRepository.GetResultWithFullDataAsync(resultId, userId);
            if (result == null)
                return null;

            // Map data to PDF DTO
            var pdfData = new ResultPdfDTO
            {
                ResultId = result.ResultId,
                ReportDate = result.ReportDate,
                TestSummary = result.TestSummary,
                ResultStatus = result.ResultStatus,
                CreateAt = result.CreateAt,
                ServiceName = result.OrderDetail.ServicePackage.ServiceName,
                OrderId = result.OrderDetail.Order.OrderId,
                OrderDate = result.OrderDetail.Order.CreateAt,
                CustomerName = result.OrderDetail.Order.Customer.Name,
                CustomerEmail = result.OrderDetail.Order.Customer.Email,
                Participants = result.OrderDetail.Order.OrderDetails
                    .SelectMany(od => od.Samples)
                    .Where(s => s.Participant != null) // Chỉ lấy samples có participant
                    .Select(s => new ParticipantPdfDTO
                    {
                        FullName = s.Participant.FullName,
                        Sex = s.Participant.Sex,
                        BirthDate = s.Participant.BirthDate,
                        Phone = s.Participant.Phone,
                        Relationship = s.Participant.Relationship,
                    })
                    .DistinctBy(p => p.FullName) // Loại bỏ trùng lặp nếu có
                    .ToList(),
                LocusResults = result.TestLocusResults.Select(tlr => new LocusResultPdfDTO
                {
                    LocusName = tlr.Locus.LocusName,
                    PersonAAlleles = tlr.PersonAAlleles,
                    PersonBAlleles = tlr.PersonBAlleles,
                    IsMatch = tlr.IsMatch
                }).ToList()
            };

            // Generate PDF
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(container => ComposeContent(container, pdfData));
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }

        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.ConstantItem(100).Image("img/logo.png", ImageScaling.FitArea);
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("BLOODLINE DNA TESTING LABORATORY").FontSize(16).Bold();
                    col.Item().Text("123 DNA Street, Ho Chi Minh City, Vietnam").FontSize(10);
                    col.Item().Text("Phone: +84 123 456 789 | Email: info@bloodlinedna.com").FontSize(10);
                });
            });
        }

        private void ComposeContent(IContainer container, ResultPdfDTO data)
        {
            container.PaddingVertical(20).Column(col =>
            {
                // Title
                col.Item().AlignCenter().Text("DNA PATERNITY TEST REPORT").FontSize(18).Bold();

                // Report Information
                col.Item().PaddingTop(20).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(2);
                        columns.RelativeColumn(3);
                    });

                    table.Cell().Text("Report ID:").Bold();
                    table.Cell().Text($"DNA-{data.ResultId:D6}");

                    table.Cell().Text("Report Date:").Bold();
                    table.Cell().Text(data.ReportDate?.ToString("dd/MM/yyyy") ?? "N/A");

                    table.Cell().Text("Test Type:").Bold();
                    table.Cell().Text(data.ServiceName);

                    table.Cell().Text("Customer:").Bold();
                    table.Cell().Text(data.CustomerName);

                    table.Cell().Text("Order ID:").Bold();
                    table.Cell().Text($"ORD-{data.OrderId:D6}");
                });

                // Participants Information
                col.Item().PaddingTop(20).Text("PARTICIPANT INFORMATION").FontSize(14).Bold();
                col.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(); // Name
                        columns.RelativeColumn(); // Sex
                        columns.RelativeColumn(); // Birth Date
                        columns.RelativeColumn(); // Phone
                        columns.RelativeColumn(); // Relationship
                    });

                    // Header
                    table.Header(header =>
                    {
                        header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Full Name").Bold();
                        header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Sex").Bold();
                        header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Birth Date").Bold();
                        header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Phone").Bold();
                        header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Relationship").Bold();
                    });

                    // Data
                    foreach (var participant in data.Participants)
                    {
                        table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(participant.FullName ?? "");
                        table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(participant.Sex ?? "");
                        table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(participant.BirthDate.ToString("dd/MM/yyyy"));
                        table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(participant.Phone ?? "");
                        table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(participant.Relationship ?? "");
                    }
                });

                // Test Results
                if (data.LocusResults.Any())
                {
                    col.Item().PaddingTop(20).Text("GENETIC MARKER RESULTS").FontSize(14).Bold();
                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(); // Locus
                            columns.RelativeColumn(); // Person A
                            columns.RelativeColumn(); // Person B
                            columns.RelativeColumn(); // Match
                        });

                        // Header
                        table.Header(header =>
                        {
                            header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Locus").Bold();
                            header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Person A").Bold();
                            header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Person B").Bold();
                            header.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text("Match").Bold();
                        });

                        // Data
                        foreach (var locus in data.LocusResults)
                        {
                            table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(locus.LocusName);
                            table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(locus.PersonAAlleles);
                            table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(locus.PersonBAlleles);
                            table.Cell().Border(1).AlignCenter().PaddingVertical(2).PaddingHorizontal(4).Text(locus.IsMatch == true ? "Yes" : "No")
                                .FontColor(locus.IsMatch == true ? "#008000" : "#FF0000");
                        }
                    });
                }

                // Summary
                if (!string.IsNullOrEmpty(data.TestSummary))
                {
                    col.Item().PaddingTop(20).Text("TEST SUMMARY").FontSize(14).Bold();
                    col.Item().Text(data.TestSummary);
                }

                // Conclusion
                col.Item().PaddingTop(20).Text("CONCLUSION").FontSize(14).Bold();
                col.Item().Text($"Based on the analysis of {data.LocusResults.Count} genetic markers, the test results indicate: {GetConclusion(data.LocusResults)}");
            });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("This report is confidential and intended for the named recipient only.").FontSize(8);
                    col.Item().Text("Generated on: " + DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss")).FontSize(8);
                });

                row.ConstantItem(200).Column(col =>
                {
                    col.Item().AlignRight().Text("Authorized Signature:").FontSize(10);
                    col.Item().AlignRight().Text("________________________").FontSize(12);
                });
            });
        }

        private string GetConclusion(List<LocusResultPdfDTO> locusResults)
        {
            if (!locusResults.Any())
                return "Insufficient data for conclusion.";

            var matchCount = locusResults.Count(l => l.IsMatch == true);
            var totalCount = locusResults.Count;

            if (matchCount == totalCount)
                return "MATCH - The tested individuals are likely to be related.";
            else if (matchCount == 0)
                return "NO MATCH - The tested individuals are not related.";
            else
                return $"PARTIAL MATCH - {matchCount}/{totalCount} markers match. Further analysis may be required.";
        }
    }
}
