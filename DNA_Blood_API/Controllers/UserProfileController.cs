using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Cors;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Customer")]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;
        private readonly IOrderService _orderService;
        private readonly IResultService _resultService;
        

        public UserProfileController(IUserProfileService userProfileService, IOrderService orderService, IResultService resultService)
        {
            _userProfileService = userProfileService;
            _orderService = orderService;
            _resultService = resultService;
        }



        [HttpGet("GetUserProfile")]
        public async Task<ActionResult<UserProfileDTO>> GetUserProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var profile = await _userProfileService.GetUserProfileByIdAsync(userId);
            if (profile == null)
            {
                return NotFound();
            }
            return Ok(profile);
        }



        [HttpPut("UpdateUserProfile")]
        public async Task<ActionResult<UserProfileDTO>> UpdateUserProfile(UpdateUserProfile profile)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var updatedProfile = await _userProfileService.UpdateUserProfileAsync(userId, profile);
            if (updatedProfile == null)
            {
                return NotFound();
            }
            return Ok(updatedProfile);
        }

        [HttpGet("GetOrderHistory")]
        public async Task<IActionResult> GetOrderHistory()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var orderHistory = await _userProfileService.GetOrderHistoryAsync(userId);
            return Ok(orderHistory);
        }

        [HttpGet("GetOrderDetail")]
        public async Task<IActionResult> GetOrderDetail(int orderId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var orderDetails = await _orderService.GetOrderDetailsAsync(orderId, userId);
            return orderDetails == null ? NotFound() : Ok(orderDetails);
        }

        [HttpGet("Results")]
        public async Task<IActionResult> GetMyResults()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var results = await _resultService.GetResultDetailsByUserIdAsync(userId);
            return Ok(results);
        }

        [HttpPost("ShareResult")]
        public async Task<IActionResult> ShareResult([FromBody] ShareResultRequestDTO request)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            await _resultService.ShareResultByEmailAsync(userId, request);
            return Ok(new { message = "Đã gửi kết quả xét nghiệm qua email." });
        }
    }
}

