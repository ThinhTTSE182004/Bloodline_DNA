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

        private int? GetUserIdFromToken()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var profileDto = await _userProfileService.GetUserProfileAsync(userId.Value);
            return profileDto == null ? NotFound() : Ok(profileDto);
        }

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateUserProfile dto)
        {
            var userId = GetUserIdFromToken();
            if (userId == null) return Unauthorized();

            var updatedDto = await _userProfileService.UpdateUserProfileAsync(userId.Value, dto);
            return updatedDto == null ? NotFound() : Ok(updatedDto);
        }
    }
}

