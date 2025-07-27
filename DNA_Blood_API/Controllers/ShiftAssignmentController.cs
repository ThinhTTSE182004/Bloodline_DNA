using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DNA_API1.Models;
using DNA_Blood_API.Services;
using DNA_Blood_API.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Linq;

namespace DNA_Blood_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin")]
    public class ShiftAssignmentController : ControllerBase
    {
        private readonly IShiftAssignmentService _shiftAssignmentService;
        private readonly DNA_API1.Repository.IUserRepository _userRepository;
        private readonly DNA_API1.Repository.IUserProfileRepository _userProfileRepository;
        public ShiftAssignmentController(IShiftAssignmentService shiftAssignmentService, DNA_API1.Repository.IUserRepository userRepository, DNA_API1.Repository.IUserProfileRepository userProfileRepository)
        {
            _shiftAssignmentService = shiftAssignmentService;
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
        }

        [HttpGet("AllAssignments")]
        public async Task<IActionResult> GetAll()
        {
            var dtoList = await _shiftAssignmentService.GetAllDTOAsync();
            return Ok(dtoList);
        }

        [HttpGet("Assignment/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var dto = await _shiftAssignmentService.GetByIdDTOAsync(id);
            if (dto == null) return NotFound();
            return Ok(dto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ShiftAssignmentCreateOrUpdateDTO assignment)
        {
            try
            {
                var dto = await _shiftAssignmentService.AddDTOAsync(assignment);
                return Ok(dto);
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ShiftAssignmentCreateOrUpdateDTO assignment)
        {
            var dto = await _shiftAssignmentService.UpdateDTOAsync(id, assignment);
            return Ok(dto);
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
            var suggestions = await _shiftAssignmentService.SuggestAssignments(request.Shifts, request.Users, request.Dates);
            return Ok(suggestions);
        }

        // Lấy danh sách medical staff kèm năm kinh nghiệm
        [HttpGet("medical-staffs")]
        public async Task<IActionResult> GetMedicalStaffs()
        {
            var result = await _shiftAssignmentService.GetMedicalStaffsAsync();
            return Ok(result);
        }

        [HttpGet("staffs")]
        public async Task<IActionResult> GetStaffs()
        {
            var result = await _shiftAssignmentService.GetStaffsAsync();
            return Ok(result);
        }
    }
} 