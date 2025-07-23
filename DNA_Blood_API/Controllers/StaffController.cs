using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using DNA_Blood_API.Services;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Staff")]
    public class StaffController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ISampleService _sampleService;
        private readonly ISampleTransferService _sampleTransferService;
        private readonly IOrderDetailService _orderDetailService;
        private readonly IFeedbackResponseService _feedbackResponseService;
        private readonly IFeedbackService _feedbackService;

        private readonly ISampleVerificationImageService _sampleVerificationImageService;

        private readonly IShiftAssignmentService _shiftAssignmentService;
        public StaffController(IOrderService orderService, ISampleService sampleService, ISampleTransferService sampleTransferService, IOrderDetailService orderDetailService, IFeedbackResponseService feedbackResponseService, IFeedbackService feedbackService, ISampleVerificationImageService sampleVerificationImageService, IShiftAssignmentService shiftAssignmentService)

        {
            _orderService = orderService;
            _sampleService = sampleService;
            _sampleTransferService = sampleTransferService;
            _orderDetailService = orderDetailService;
            _feedbackResponseService = feedbackResponseService;
            _feedbackService = feedbackService;

            _sampleVerificationImageService = sampleVerificationImageService;

            _shiftAssignmentService = shiftAssignmentService;

        }

        // Danh sách mẫu xét nghiệm cần ghi nhận theo nhân viên phụ trách (loại, kit, trạng thái)
        [HttpGet("get-sample-by-staffId")]
        public async Task<IActionResult> GetSamplesToRecord()
        {
            try
            {
                var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
                var samples = await _sampleService.GetSamplesByStaffIdAsync(staffId);
                return Ok(samples);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Đã xảy ra lỗi khi lấy danh sách mẫu.", error = ex.Message });
            }
        }

        // Cái sample_transfer được phụ trách bởi staffId
        [HttpGet("get-sample-transfers-by-staffId")]
        public async Task<IActionResult> GetSampleTransfers()
        {
            var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var transfers = await _sampleTransferService.GetSampleTransfersByStaffIdAsync(staffId);
            return Ok(transfers);
        }

        // Giao kit: chuyển sang trạng thái Delivering Kit
        [HttpPut("deliver-kit/{transferId}")]
        public async Task<IActionResult> DeliverKit(int transferId)
        {
            var result = await _sampleTransferService.UpdateSampleTransferStatusAsync(transferId, "Delivering Kit");
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }

        // Thu mẫu: chuyển sang trạng thái Collecting Sample
        [HttpPut("collect-sample/{transferId}")]
        public async Task<IActionResult> CollectSample(int transferId)
        {
            var result = await _sampleTransferService.UpdateSampleTransferStatusAsync(transferId, "Collecting Sample");
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }

        // Giao mẫu đến lab: chuyển sang trạng thái Delivering to Lab
        [HttpPut("deliver-to-lab/{transferId}")]
        public async Task<IActionResult> DeliverToLab(int transferId)
        {
            var result = await _sampleTransferService.UpdateSampleTransferStatusAsync(transferId, "Delivering to Lab");
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }

        [HttpGet("assigned-order-details")]
        public async Task<IActionResult> GetAssignedOrderDetails()
        {
            var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var orderDetails = await _orderDetailService.GetOrderDetailsByStaffIdAsync(staffId);
            return Ok(orderDetails);
        }

        [HttpPost("feedback-response")]
        public async Task<IActionResult> PostFeedbackResponse([FromBody] DNA_API1.ViewModels.CreateFeedbackResponseDTO dto)
        {
            var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var response = new DNA_API1.Models.FeedbackResponse
            {
                FeedbackId = dto.FeedbackId,
                StaffId = staffId,
                ContentResponse = dto.ContentResponse,
                CreateAt = dto.CreateAt ?? DateTime.Now,
                UpdateAt = null
            };
            await _feedbackResponseService.AddAsync(response);
            return Ok(new { message = "Phản hồi đánh giá thành công." });
        }

        [HttpGet("feedback-list")]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var feedbacks = await _feedbackService.GetAllWithResponsesAsync();
            return Ok(feedbacks);
        }



        // Upload ảnh xác minh mẫu
        [HttpPost("upload-sample-verification-image")]
        public async Task<IActionResult> UploadSampleVerificationImage([FromBody] SampleVerificationImageCreateDTO model)
        {
            var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var result = await _sampleVerificationImageService.UploadVerificationImageAsync(model, staffId);
            if (!result.Success)
                return StatusCode(result.StatusCode, new { message = result.Message });
            return Ok(new { message = "Upload ảnh xác minh thành công." });
        }

        // Lấy danh sách ảnh xác minh của một sample
        [HttpGet("sample-verification-images/{sampleId}")]
        public async Task<IActionResult> GetSampleVerificationImages(int sampleId)
        {
            var images = await _sampleVerificationImageService.GetImagesBySampleIdAsync(sampleId);
            return Ok(images);
            
        }
        [HttpGet("work-schedule")]
        public async Task<IActionResult> GetWorkSchedule([FromQuery] int? month, [FromQuery] int? year)
        {
            var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var now = DateTime.Now;
            int m = month ?? now.Month;
            int y = year ?? now.Year;
            var shifts = await _shiftAssignmentService.GetWorkShiftsByUserAndMonthAsync(staffId, m, y);
            return Ok(shifts);

        }
    }
}
