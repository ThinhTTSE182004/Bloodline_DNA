using DNA_API1.Models;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using DNA_API1.Hubs;
using DNA_Blood_API.Services;

namespace DNA_API1.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Medical Staff")]
    [Route("api/[controller]")]
    [ApiController]
    public class MedicalStaffController : ControllerBase
    {
        private readonly ISampleService _sampleService;
        private readonly ISampleTransferService _sampleTransferService;
        private readonly IResultService _resultService;
        private readonly IOrderDetailService _orderDetailService;
        private readonly IHubContext<UserHub> _hubContext;
        private readonly IShiftAssignmentService _shiftAssignmentService;
        private readonly ISampleVerificationImageService _sampleVerificationImageService;

        public MedicalStaffController(
            ISampleService sampleService,
            ISampleTransferService sampleTransferService,
            IResultService resultService,
            IOrderDetailService orderDetailService,
            IHubContext<UserHub> hubContext,
            IShiftAssignmentService shiftAssignmentService,
            ISampleVerificationImageService sampleVerificationImageService) 
        {
            _sampleService = sampleService;
            _sampleTransferService = sampleTransferService;
            _resultService = resultService;
            _orderDetailService = orderDetailService;
            _hubContext = hubContext;
            _shiftAssignmentService = shiftAssignmentService;
            _sampleVerificationImageService = sampleVerificationImageService;
        }
        // Nhận mẫu: cập nhật trạng thái Sample.Status = "Processing"
        [HttpPut("receive-sample/{sampleId}")]
        public async Task<IActionResult> ReceiveSample(int sampleId)
        {
            var success = await _sampleService.UpdateSampleStatusMedicalAsync(sampleId, new ViewModels.SampleUpdateMedical { SampleStatus = "Processing" });
            if (!success)
                return NotFound("Sample not found");
            return Ok("Sample status updated to Processing");
        }

        // Hoàn thành xét nghiệm: cập nhật trạng thái Sample.Status = "Completed"
        [HttpPut("complete-sample/{sampleId}")]
        public async Task<IActionResult> CompleteSample(int sampleId)
        {
            var success = await _sampleService.UpdateSampleStatusMedicalAsync(sampleId, new ViewModels.SampleUpdateMedical { SampleStatus = "Completed" });
            if (!success)
                return NotFound("Sample not found");
            return Ok("Sample status updated to Completed");
        }
        // Lấy cái sample theo Medical
        [HttpGet("get-sample-by-medicalStaffId")]
        public async Task<IActionResult> GetSamplesByMedicalStaffId()
        {
            var medicalStaffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var samples = await _sampleService.GetSamplesByMedicalStaffIdAsync(medicalStaffId);
            return Ok(samples);
        }

        // Cập nhật sample_transfer là đã nhận được mẫu
        [HttpPut("confirm-sample-transfer-received/{transferId}")]
        public async Task<IActionResult> ConfirmSampleTransferReceived(int transferId)
        {
            var medicalStaffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var result = await _sampleTransferService.ConfirmSampleTransferReceivedAsync(transferId, medicalStaffId);
            if (!result.Success) return BadRequest(result.Message);
            return Ok(result.Message);
        }

        // Lấy các sample_transfer theo medical
        [HttpGet("get-sample-transfers-by-medicalStaffId")]
        public async Task<IActionResult> GetSampleTransfers()
        {
            var medicalStaffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var transfers = await _sampleTransferService.GetSampleTransfersByMedicalStaffIdAsync(medicalStaffId);
            return Ok(transfers);
        }

        // Update orderDetail khi tất cả các sample của đơn đó đã ở trạng thái Đã hoàn thành.
        [HttpPut("update-status-order-detail/{orderDetailId}")]
        public async Task<IActionResult> AutoUpdateStatus(int orderDetailId)
        {
            var result = await _orderDetailService.UpdateOrderDetailStatusIfAllSamplesCompletedAsync(orderDetailId);
            if (!result) return NotFound("OrderDetail không tồn tại hoặc chưa đủ điều kiện.");

            // Sau khi update thành công, lấy orderDetail để lấy userId
            var orderDetail = await _orderDetailService.GetOrderDetailByIdAsync(orderDetailId);
            if (orderDetail != null && orderDetail.Order != null)
            {
                var userId = orderDetail.Order.CustomerId;
                var message = $"Order #{orderDetail.Order.OrderId} The test results are available!";
                await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveResultNotification", orderDetail.Order.OrderId.ToString(), message);
            }

            return Ok("Ok");
        }


        // Lấy các order_detail của Medical phụ trách
        [HttpGet("order-details")]
        public async Task<IActionResult> GetOrderDetailsForMedicalStaff()
        {
            try
            {
                var medicalStaffIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(medicalStaffIdString))
                {
                    return Unauthorized("Không thể xác định người dùng từ token.");
                }

                var medicalStaffId = int.Parse(medicalStaffIdString);

                // Gọi service để lấy danh sách order details
                var orderDetails = await _orderDetailService.GetOrderDetailsByMedicalStaffIdAsync(medicalStaffId);

                return Ok(orderDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Đã có lỗi xảy ra ở phía server.");
            }
        }

        // Tạo kết quả với thông tin locus chi tiết (cho PDF)
        [HttpPost("add-result")]
        public async Task<IActionResult> AddResult([FromBody] CreateResultWithLocusDTO result)
        {
            try
            {
                var createdResult = await _resultService.AddResultWithLocusAsync(result);
                return Ok(new 
                { 
                    message = "Kết quả đã được tạo thành công với thông tin locus chi tiết",
                    resultId = createdResult.ResultId,
                    result = createdResult
                });
            }
            catch (Exception ex)
            {
                // Log lỗi chi tiết
                Console.WriteLine($"Error in AddResult: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                
                return BadRequest(new { 
                    message = "Có lỗi xảy ra khi tạo kết quả",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }

        [HttpGet("work-schedule")]
        public async Task<IActionResult> GetWorkSchedule([FromQuery] int? month, [FromQuery] int? year)
        {
            var medicalStaffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var now = DateTime.Now;
            int m = month ?? now.Month;
            int y = year ?? now.Year;
            var shifts = await _shiftAssignmentService.GetWorkShiftsByUserAndMonthAsync(medicalStaffId, m, y);
            return Ok(shifts);
        }

        [HttpGet("sample-images/{sampleId}")]
        public async Task<IActionResult> GetSampleImagesBySampleId(int sampleId)
        {
            var medicalStaffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
         
            var imageVMs = await _sampleVerificationImageService.GetImageVMsBySampleIdAsync(sampleId);
            return Ok(imageVMs);
        }

        [HttpPost("verify-sample-image/{verificationImageId}")]
        public async Task<IActionResult> VerifySampleImage(int verificationImageId, [FromBody] SampleVerificationImageVerifyDTO model)
        {
            var medicalStaffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);

            var success = await _sampleVerificationImageService.VerifyImageAsync(verificationImageId, model, medicalStaffId);
            if (!success)
                return StatusCode(403, new { message = "Bạn không có quyền xác nhận ảnh này hoặc ảnh không tồn tại." });

            return Ok(new { message = "Xác nhận ảnh thành công." });
        }
    }
}
