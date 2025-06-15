using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Staff")]
    public class StaffController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ISampleService _sampleService;
        public StaffController(IOrderService orderService, ISampleService sampleService)
        {
            _orderService = orderService;
            _sampleService = sampleService;
        }

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

        [HttpGet]
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

        [HttpPut("update-sample/{sampleId}")]
        public async Task<IActionResult> UpdateSample(int sampleId, [FromBody] SampleUpdateViewModel model)
        {
            var success = await _sampleService.UpdateSampleStatusAsync(sampleId, model);
            if (!success)
                return NotFound("Sample not found");

            return Ok("Sample updated successfully");
        }
    }
}
