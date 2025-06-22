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
        private readonly IStaffScheduleService _staffScheduleService;

        public StaffScheduleController(IStaffAssignmentService staffAssignmentService, IStaffScheduleService staffScheduleService)
        {
            _staffAssignmentService = staffAssignmentService;
            _staffScheduleService = staffScheduleService;
        }

        [HttpGet("staff/{staffId}/availability")]
        public async Task<IActionResult> GetStaffAvailability(int staffId, [FromQuery] DateTime date, [FromQuery] int durationMinutes = 30)
        {
            try
            {
                var availableSlots = await _staffAssignmentService.GetAvailableTimeSlotsForStaffAsync(staffId, date, durationMinutes);
                
                return Ok(new
                {
                    staffId = staffId,
                    date = date.Date,
                    requiredDuration = durationMinutes,
                    availableSlots = availableSlots.Select(slot => new
                    {
                        startTime = slot,
                        endTime = slot.AddMinutes(durationMinutes)
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy lịch trình nhân viên", error = ex.Message });
            }
        }

        [HttpGet("medical-staff/{medicalStaffId}/availability")]
        public async Task<IActionResult> GetMedicalStaffAvailability(int medicalStaffId, [FromQuery] DateTime date, [FromQuery] int durationMinutes = 30)
        {
            try
            {
                var availableSlots = await _staffAssignmentService.GetAvailableTimeSlotsForMedicalStaffAsync(medicalStaffId, date, durationMinutes);
                
                return Ok(new
                {
                    medicalStaffId = medicalStaffId,
                    date = date.Date,
                    requiredDuration = durationMinutes,
                    availableSlots = availableSlots.Select(slot => new
                    {
                        startTime = slot,
                        endTime = slot.AddMinutes(durationMinutes)
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy lịch trình nhân viên y tế", error = ex.Message });
            }
        }

        [HttpPost("staff/{staffId}/check-availability")]
        public async Task<IActionResult> CheckStaffAvailability(int staffId, [FromBody] CheckAvailabilityRequest request)
        {
            try
            {
                var isAvailable = await _staffAssignmentService.CheckStaffAvailabilityAsync(staffId, request.StartTime, request.DurationMinutes);
                
                return Ok(new
                {
                    staffId = staffId,
                    startTime = request.StartTime,
                    durationMinutes = request.DurationMinutes,
                    isAvailable = isAvailable
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi kiểm tra lịch trình nhân viên", error = ex.Message });
            }
        }

        [HttpPost("medical-staff/{medicalStaffId}/check-availability")]
        public async Task<IActionResult> CheckMedicalStaffAvailability(int medicalStaffId, [FromBody] CheckAvailabilityRequest request)
        {
            try
            {
                var isAvailable = await _staffAssignmentService.CheckMedicalStaffAvailabilityAsync(medicalStaffId, request.StartTime, request.DurationMinutes);
                
                return Ok(new
                {
                    medicalStaffId = medicalStaffId,
                    startTime = request.StartTime,
                    durationMinutes = request.DurationMinutes,
                    isAvailable = isAvailable
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi kiểm tra lịch trình nhân viên y tế", error = ex.Message });
            }
        }

        [HttpGet("staff/{staffId}/schedule-detail")]
        public async Task<IActionResult> GetStaffScheduleDetail(int staffId, [FromQuery] DateTime date)
        {
            try
            {
                var schedule = await _staffScheduleService.GetStaffScheduleDetailAsync(staffId, date);
                
                if (schedule == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin nhân viên" });
                }
                
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin lịch trình chi tiết", error = ex.Message });
            }
        }

        [HttpGet("medical-staff/{medicalStaffId}/schedule-detail")]
        public async Task<IActionResult> GetMedicalStaffScheduleDetail(int medicalStaffId, [FromQuery] DateTime date)
        {
            try
            {
                var schedule = await _staffScheduleService.GetMedicalStaffScheduleDetailAsync(medicalStaffId, date);
                
                if (schedule == null)
                {
                    return NotFound(new { message = "Không tìm thấy thông tin nhân viên y tế" });
                }
                
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin lịch trình chi tiết", error = ex.Message });
            }
        }

        [HttpGet("staff/{staffId}/busy-slots")]
        public async Task<IActionResult> GetStaffBusySlots(int staffId, [FromQuery] DateTime date)
        {
            try
            {
                var busySlots = await _staffScheduleService.GetStaffBusyTimeSlotsWithDetailsAsync(staffId, date);
                
                return Ok(new
                {
                    staffId = staffId,
                    date = date.Date,
                    busySlots = busySlots
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin thời gian bận", error = ex.Message });
            }
        }

        [HttpGet("medical-staff/{medicalStaffId}/busy-slots")]
        public async Task<IActionResult> GetMedicalStaffBusySlots(int medicalStaffId, [FromQuery] DateTime date)
        {
            try
            {
                var busySlots = await _staffScheduleService.GetMedicalStaffBusyTimeSlotsWithDetailsAsync(medicalStaffId, date);
                
                return Ok(new
                {
                    medicalStaffId = medicalStaffId,
                    date = date.Date,
                    busySlots = busySlots
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin thời gian bận", error = ex.Message });
            }
        }
    }

    public class CheckAvailabilityRequest
    {
        public DateTime StartTime { get; set; }
        public int DurationMinutes { get; set; }
    }
} 