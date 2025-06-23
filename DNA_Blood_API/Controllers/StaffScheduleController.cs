using DNA_API1.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DNA_API1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "Admin,Manager")]
    public class StaffScheduleController : ControllerBase
    {
        private readonly IStaffAssignmentService _staffAssignmentService;

        public StaffScheduleController(IStaffAssignmentService staffAssignmentService)
        {
            _staffAssignmentService = staffAssignmentService;
        }

        [HttpPost("assign-staff")]
        public async Task<IActionResult> AssignStaff([FromBody] AssignStaffRequest request)
        {
            try
            {
                var (medicalStaffId, staffId) = await _staffAssignmentService.AssignStaffAsync(
                    request.ServicePackageId, 
                    request.BookingDate
                );
                
                return Ok(new
                {
                    servicePackageId = request.ServicePackageId,
                    bookingDate = request.BookingDate,
                    assignedMedicalStaffId = medicalStaffId,
                    assignedStaffId = staffId,
                    message = "Phân công nhân viên thành công"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi phân công nhân viên", error = ex.Message });
            }
        }
    }

    public class AssignStaffRequest
    {
        public int ServicePackageId { get; set; }
        public DateTime? BookingDate { get; set; }
    }
} 