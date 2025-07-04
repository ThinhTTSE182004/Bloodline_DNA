using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DNA_Blood_API.Services;
using DNA_Blood_API.ViewModels;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using System.Security.Claims;

namespace DNA_Blood_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class AdminController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;
        private readonly IBlogService _blogService;

        public AdminController(IAdminDashboardService dashboardService, IBlogService blogService)
        {
            _dashboardService = dashboardService;
            _blogService = blogService;
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPost("dashboard")]
        public async Task<IActionResult> GetDashboard([FromBody] AdminDashboardFilterDTO filter)
        {
            var data = await _dashboardService.GetDashboardAsync(filter);
            return Ok(data);
        }
        [HttpGet("test-auth")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public IActionResult TestAuth()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
            return Ok(new
            {
                IsAuthenticated = User.Identity.IsAuthenticated,
                Name = User.Identity.Name,
                Claims = claims
            });
        }

        // BLOG MANAGEMENT ENDPOINTS
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("blogs")]
        public async Task<IActionResult> GetAllBlogs()
        {
            var blogs = await _blogService.GetAllBlogsAsync();
            return Ok(blogs);
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpGet("blogs/{id}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            var blog = await _blogService.GetBlogByIdAsync(id);
            if (blog == null) return NotFound();
            return Ok(blog);
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPost("blogs")]
        public async Task<IActionResult> CreateBlog([FromBody] BlogCreateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            await _blogService.AddBlogAsync(dto, userId);
            return Ok(new { message = "Blog created successfully" });
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpPut("blogs/{id}")]
        public async Task<IActionResult> UpdateBlog(int id, [FromBody] BlogUpdateDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (id != dto.BlogId) return BadRequest("Id mismatch");
            await _blogService.UpdateBlogAsync(dto);
            return Ok(new { message = "Blog updated successfully" });
        }
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
        [HttpDelete("blogs/{id}")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            await _blogService.DeleteBlogAsync(id);
            return Ok(new { message = "Blog deleted successfully" });
        }
    }
} 