using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        public StaffController(IOrderService orderService, ISampleService sampleService, ISampleTransferService sampleTransferService)
        {
            _orderService = orderService;
            _sampleService = sampleService;
            _sampleTransferService = sampleTransferService;
        }
        // Xác nhận thanh toán thành công
        [HttpPut("confirm-order/{id}")]
        public async Task<IActionResult> ConfirmOrder(int id)
        {
            try
            {
                var result = await _orderService.ConfirmOrderAsync(id);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy đơn hàng." });

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi máy chủ", error = ex.Message });
            }
        }
        //Danh sách đơn hàng 
        [HttpGet("get-all-orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _orderService.GetAllOrdersForStaffAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi lấy danh sách đơn hàng.",
                    error = ex.Message
                });
            }
        }

        // Cái này là chỉ update sample-status và ngày lấy mẫu thôi, còn ngày nhận mẫu thì là medical
        [HttpPut("update-sample-status/{sampleId}")]
        public async Task<IActionResult> UpdateSample(int sampleId, [FromBody] SampleUpdateStaff model)
        {
            var success = await _sampleService.UpdateSampleStatusStaffAsync(sampleId, model);
            if (!success)
                return NotFound("Sample not found");

            return Ok("Sample updated successfully");
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

        // Update sample_transfer_status thành đang được đưa cho medical
        [HttpPut("confirm-sample-transfer-status/{transferId}")]
        public async Task<IActionResult> ConfirmSampleTransfer(int transferId)
        {
            var success = await _sampleTransferService.ConfirmSampleTransferAsync(transferId);
            if (!success) return NotFound("Sample transfer not found");
            return Ok("Sample transfer status updated to 'Đang được đưa'");
        }


        // Cái sample_transfer được phụ trách bởi staffId
        [HttpGet("get-sample-transfers-by-staffId")]
        public async Task<IActionResult> GetSampleTransfers()
        {
            var staffId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var transfers = await _sampleTransferService.GetSampleTransfersByStaffIdAsync(staffId);
            return Ok(transfers);
        }

    }
}
