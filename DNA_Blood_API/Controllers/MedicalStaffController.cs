using DNA_API1.Models;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        public MedicalStaffController(ISampleService sampleService, ISampleTransferService sampleTransferService, IResultService resultService, IOrderDetailService orderDetailService)
        {
            _sampleService = sampleService;
            _sampleTransferService = sampleTransferService;
            _resultService = resultService;
            _orderDetailService = orderDetailService;
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
            var result = await _sampleTransferService.ConfirmSampleTransferReceivedAsync(transferId);
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
    }
}
