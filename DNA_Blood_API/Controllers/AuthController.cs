

using DNA_API1.Models;
using DNA_API1.ViewModels;
using LoginAPI.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.Google;
using System.Web;
using DNA_API1.Services;

namespace LoginAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase

    {
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;
        private readonly IEmailService  _emailService;
        private readonly IPasswordResetService _passwordResetService;

        public AuthController(IAuthService authService, ITokenService tokenService, IEmailService emailService, IPasswordResetService passwordResetService)
        {
            _authService = authService;
            _tokenService = tokenService;
            _emailService = emailService;
            _passwordResetService = passwordResetService;
        }
   


        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO model)
        {
            await _passwordResetService.SendForgotPasswordEmailAsync(model.Email);
            return Ok(new { message = "Đã gửi email đặt lại mật khẩu (nếu email tồn tại)." });
        }

        public class ResetPasswordRequestDTO
        {
            public string Token { get; set; }
            public string NewPassword { get; set; }
        }

        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDTO model)
        {
            await _passwordResetService.ResetPasswordAsync(model.Token, model.NewPassword);
            return Ok(new { message = "Đổi mật khẩu thành công." });
        }


        [HttpPost("register")]
        public async Task<ActionResult<UserProfileDTO>> Register(RegisterDTO request)
        {
            var user = await _authService.RegisterAsync(request);
            if (user is null)
            {
                return BadRequest("Email already exists");
            }
            return Ok(user);
        }


        [HttpPost("registerForStaff")]
        public async Task<ActionResult<UserProfileDTO>> RegisterForStaff(RegisterDTO request)
        {
            var user = await _authService.RegisterStaffAsync(request);
            if (user is null)
            {
                return BadRequest("Email already exists");
            }
            return Ok(user);
        }


        [HttpPost("registerForMedicalStaff")]
        public async Task<ActionResult<UserProfileDTO>> RegisterForMedicalStaff(RegisterMedicalStaff request)
        {
            var user = await _authService.RegisterMedicalStaffAsync(request);
            if (user is null)
            {
                return BadRequest("Email already exists");
            }
            return Ok(user);
        }



        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDTO request)
        {
            var token = await _authService.LoginAsync(request);
            if (token is null)
            {
                return BadRequest("Invalid username or password");
            }
            return Ok(token);
        }
        [Authorize(Roles ="Admin")]
        [HttpGet("admin-auth")]
        public IActionResult Authentication()
        {
            return Ok("You are Admin!");
        }

        [Authorize(Roles = "Customer")]
        [HttpGet("customer-auth")]
        public IActionResult AuthenticationAdmin()
        {
            return Ok("You are Customer!");
        }


        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback")
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google-callback")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);

            var email = result.Principal.FindFirst(ClaimTypes.Email)?.Value;
            var name = result.Principal.FindFirst(ClaimTypes.Name)?.Value;

            var token = await _authService.HandleGoogleLoginAsync(email, name);
            var encodedToken = Uri.EscapeDataString(token);

            Console.WriteLine(token);
            var frontendUrl = $"http://localhost:5173/oauth-success?token={encodedToken}";
            return Redirect(frontendUrl);

        }
    }
}
