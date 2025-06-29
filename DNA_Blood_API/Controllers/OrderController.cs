using System.Security.Claims;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
  
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;

        public OrderController(IOrderService orderService, IPaymentService paymentService)
        {
            _orderService = orderService;
            _paymentService = paymentService;
        }

        // Lấy user_id từ token
        private int? GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
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
                    error = ex.ToString() // Trả về cả stack trace
                });
            }
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("orders-by-payment-status")]
        public async Task<IActionResult> GetOrdersByPaymentStatus([FromQuery] string status)
        {
            var orders = await _orderService.GetOrdersByPaymentStatusAsync(status);
            return Ok(orders);
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("all-orders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }

        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPut("update-payment-status")]
        public IActionResult UpdatePaymentStatusByOrder([FromBody] UpdatePaymentStatusByOrderDTO dto)
        {
            var result = _paymentService.UpdatePaymentStatusByOrderId(dto.OrderId, dto.Status);
            if (result)
                return Ok(new { message = "Payment status updated successfully." });
            return NotFound(new { message = "Payment not found for the given orderId." });
        }
    }
}
