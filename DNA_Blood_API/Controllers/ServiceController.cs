using DNA_API1.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet("GetAllServiceWithPrice")]
        public async Task<IActionResult> Get()
        {
            var services = await _serviceService.GetAllServicesWithPriceAsync();
            return Ok(services);
        }
    }
}
