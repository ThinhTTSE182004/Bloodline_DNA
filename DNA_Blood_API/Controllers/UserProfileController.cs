using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfileController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public UserProfileController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
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
            var orderDetail = await _userProfileService.GetOrderDetailAsync(orderId, userId);
            return orderDetail == null ? NotFound() : Ok(orderDetail);
        }
    }
}

