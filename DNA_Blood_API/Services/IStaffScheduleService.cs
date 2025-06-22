using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IStaffScheduleService
    {
        // Các phương thức để lấy thông tin lịch trình chi tiết
        Task<StaffScheduleDTO?> GetStaffScheduleDetailAsync(int staffId, DateTime date);
        Task<StaffScheduleDTO?> GetMedicalStaffScheduleDetailAsync(int medicalStaffId, DateTime date);
        
        // Các phương thức để lấy thông tin thời gian bận
        Task<List<TimeSlotDTO>> GetStaffBusyTimeSlotsWithDetailsAsync(int staffId, DateTime date);
        Task<List<TimeSlotDTO>> GetMedicalStaffBusyTimeSlotsWithDetailsAsync(int medicalStaffId, DateTime date);
    }
} 