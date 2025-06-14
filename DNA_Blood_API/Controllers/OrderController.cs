using System.Security.Claims;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Customer")] // Chỉ khách hàng mới được tạo đơn hàng
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // Lấy user_id từ token
        private int? GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
        }

        [HttpPost("CreateOrder")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderWithPaymentDTO dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var customerId = GetUserIdFromToken();
            if (customerId == null)
                return Unauthorized();

            try
            {
                dto.CustomerId = customerId.Value;
                var orderId = await _orderService.CreateOrderWithPaymentAsync(dto);

                return Ok(new
                {
                    message = "Đơn hàng đã được tạo thành công",
                    orderId = orderId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Đã xảy ra lỗi khi tạo đơn hàng",
                    error = ex.Message
                });
            }
        }
    }
}
