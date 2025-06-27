using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DNA_Blood_API.Services;
using DNA_Blood_API.ViewModels;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace DNA_Blood_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminDashboardService _dashboardService;
        public AdminController(IAdminDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpPost("dashboard")]
        public async Task<IActionResult> GetDashboard([FromBody] AdminDashboardFilterDTO filter)
        {
            var data = await _dashboardService.GetDashboardAsync(filter);
            return Ok(data);
        }
    }
} 