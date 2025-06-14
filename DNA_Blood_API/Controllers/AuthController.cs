

using DNA_API1.Models;
using DNA_API1.ViewModels;
using LoginAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace LoginAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<UserProfileDTO>> Register(RegisterDTO request)
        {
            var user = await authService.RegisterAsync(request);
            if (user is null)
            {
                return BadRequest("Email already exists");
            }
            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(LoginDTO request)
        {
            var token = await authService.LoginAsync(request);
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
    }
}
