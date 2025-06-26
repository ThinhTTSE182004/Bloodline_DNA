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
        private readonly IFeedbackService _feedbackService;
        private readonly IFeedbackResponseService _feedbackResponseService;
        

        public UserProfileController(IUserProfileService userProfileService, IOrderService orderService, IResultService resultService, IFeedbackService feedbackService, IFeedbackResponseService feedbackResponseService)
        {
            _userProfileService = userProfileService;
            _orderService = orderService;
            _resultService = resultService;
            _feedbackService = feedbackService;
            _feedbackResponseService = feedbackResponseService;
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

        [HttpPost("Feedback")]
        public async Task<IActionResult> PostFeedback([FromBody] DNA_API1.ViewModels.CreateFeedbackDTO dto)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);

            var order = await _orderService.GetOrderByIdAndUserIdAsync(dto.OrderId, userId);
            if (order == null)
                return BadRequest("Đơn hàng không tồn tại hoặc không thuộc về bạn.");

            // 2. Kiểm tra đã feedback chưa
            if (await _feedbackService.ExistsByOrderIdAsync(dto.OrderId))
                return BadRequest("Đơn hàng này đã có feedback.");

            // 3. Lưu feedback
            var feedback = new DNA_API1.Models.Feedback
            {
                OrderId = dto.OrderId,
                Name = dto.Name,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreateAt = dto.CreateAt ?? DateTime.Now,
                UpdateAt = null
            };
            await _feedbackService.AddAsync(feedback);
            return Ok(new { message = "Gửi đánh giá thành công." });
        }

        [HttpGet("FeedbackResponse/{feedbackId}")]
        public async Task<IActionResult> GetFeedbackResponses(int feedbackId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var contents = await _feedbackResponseService.GetContentsByFeedbackIdAndUserIdAsync(feedbackId, userId);
            return Ok(contents);
        }
    }
}

