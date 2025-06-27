using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DNA_API1.Services;
using DNA_API1.ViewModels;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class ServicePackageController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServicePackageController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        // Lấy tất cả dịch vụ kèm giá
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _serviceService.GetAllServicesWithPriceAsync();
            return Ok(result);
        }

        // Thêm mới dịch vụ
        [HttpPost]
        public async Task<IActionResult> Add([FromBody] CreateServiceDTO dto)
        {
            var result = await _serviceService.AddServiceAsync(dto);
            return Ok(result);
        }

        // Chỉnh sửa thông tin dịch vụ
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceDTO dto)
        {
            var result = await _serviceService.UpdateServiceAsync(id, dto);
            return Ok(result);
        }

        // Xóa dịch vụ
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _serviceService.DeleteServiceAsync(id);
            return NoContent();
        }

        // Cập nhật giá dịch vụ
        [HttpPut("UpdatePrice/{servicePackageId}")]
        public async Task<IActionResult> UpdatePrice(int servicePackageId, [FromBody] UpdateServicePriceDTO dto)
        {
            var result = await _serviceService.UpdateServicePriceAsync(servicePackageId, dto.Price);
            return Ok(result);
        }


       
    }
} 