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
            var suggestions = await _shiftAssignmentService.SuggestAssignments(request.Shifts, request.Users, request.Dates);
            return Ok(suggestions);
        }

        // Lấy danh sách medical staff kèm năm kinh nghiệm
        [HttpGet("medical-staffs")]
        public async Task<IActionResult> GetMedicalStaffs()
        {
            var medicalStaffs = await _userRepository.FindAsync(u => u.RoleId == 4);
            var result = new List<DNA_Blood_API.ViewModels.MedicalStaffSimpleDTO>();
            foreach (var u in medicalStaffs)
            {
                var profile = await _userProfileRepository.GetByUserIdAsync(u.UserId);
                result.Add(new DNA_Blood_API.ViewModels.MedicalStaffSimpleDTO
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    RoleId = u.RoleId ?? 0,
                    YearsOfExperience = profile?.YearsOfExperience
                });
            }
            return Ok(result);
        }

        // Lấy danh sách staff
        [HttpGet("staffs")]
        public async Task<IActionResult> GetStaffs()
        {
            var staffs = await _userRepository.FindAsync(u => u.RoleId == 2);
            var result = staffs.Select(u => new DNA_Blood_API.ViewModels.UserSimpleDTO
            {
                UserId = u.UserId,
                Name = u.Name,
                RoleId = u.RoleId ?? 0
            }).ToList();
            return Ok(result);
        }
    }
} 