using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DNA_API1.Models;
using DNA_Blood_API.Services;
using DNA_Blood_API.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace DNA_Blood_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class ShiftAssignmentController : ControllerBase
    {
        private readonly IShiftAssignmentService _shiftAssignmentService;
        public ShiftAssignmentController(IShiftAssignmentService shiftAssignmentService)
        {
            _shiftAssignmentService = shiftAssignmentService;
        }

        [HttpGet("AllAssignments")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _shiftAssignmentService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("Assignment/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _shiftAssignmentService.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ShiftAssignmentCreateOrUpdateDTO assignment)
        {
            var created = await _shiftAssignmentService.AddAsync(assignment);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ShiftAssignmentCreateOrUpdateDTO assignment)
        {
            var updated = await _shiftAssignmentService.UpdateAsync(id, assignment);
            return Ok(updated);
        }

        [HttpDelete("DeleteAssignment/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _shiftAssignmentService.DeleteAsync(id);
            return NoContent();
        }

        // Endpoint phân ca tự động
        [HttpPost("SuggestAssignments")]
        public async Task<IActionResult> SuggestAssignments([FromBody] SuggestAssignmentsRequestDTO request)
        {
            var suggestions = await _shiftAssignmentService.SuggestAssignments(request.Shifts, request.Users, request.Dates, request.MaxShiftPerMonth);
            return Ok(suggestions);
        }
    }
} 