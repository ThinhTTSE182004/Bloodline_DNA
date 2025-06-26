using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DNA_API1.Models;
using DNA_Blood_API.Services;
using System.Threading.Tasks;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace DNA_Blood_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class WorkShiftController : ControllerBase
    {
        private readonly IWorkShiftService _workShiftService;
        public WorkShiftController(IWorkShiftService workShiftService)
        {
            _workShiftService = workShiftService;
        }

        [HttpGet("WorkShift")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _workShiftService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("SearchWorkShift")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _workShiftService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("CreateWorkShift")]
        public async Task<IActionResult> Create([FromBody] WorkShiftCreateOrUpdateDTO dto)
        {
            var created = await _workShiftService.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.ShiftId }, created);
        }

        [HttpPut("UpdateWorkShift")]
        public async Task<IActionResult> Update(int id, [FromBody] WorkShiftCreateOrUpdateDTO dto)
        {
            var updated = await _workShiftService.UpdateAsync(id, dto);
            return Ok(updated);
        }

        [HttpDelete("DeleteWorkShift")]
        public async Task<IActionResult> Delete(int id)
        {
            await _workShiftService.DeleteAsync(id);
            return NoContent();
        }
    }
} 