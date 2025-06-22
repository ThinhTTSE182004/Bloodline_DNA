using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IStaffScheduleRepository
    {
        // Các phương thức để kiểm tra lịch trình
        Task<List<User>> GetAvailableMedicalStaffWithScheduleAsync(string serviceName, int requiredDuration);
        Task<List<User>> GetAvailableStaffWithScheduleAsync(int requiredDuration);
        Task<bool> IsStaffAvailableAtTimeAsync(int staffId, DateTime startTime, int durationMinutes);
        Task<bool> IsMedicalStaffAvailableAtTimeAsync(int medicalStaffId, DateTime startTime, int durationMinutes);
        
        // Các phương thức để lấy thời gian bận
        Task<List<DateTime>> GetStaffBusyTimeSlotsAsync(int staffId, DateTime date);
        Task<List<DateTime>> GetMedicalStaffBusyTimeSlotsAsync(int medicalStaffId, DateTime date);
        Task<List<(DateTime StartTime, int DurationMinutes)>> GetStaffBusyTimeWithDurationAsync(int staffId, DateTime date);
        Task<List<(DateTime StartTime, int DurationMinutes)>> GetMedicalStaffBusyTimeWithDurationAsync(int medicalStaffId, DateTime date);
        
        // Các phương thức để lấy thông tin chi tiết về lịch trình
        Task<StaffScheduleDTO?> GetStaffScheduleDetailAsync(int staffId, DateTime date);
        Task<StaffScheduleDTO?> GetMedicalStaffScheduleDetailAsync(int medicalStaffId, DateTime date);
        Task<List<TimeSlotDTO>> GetStaffBusyTimeSlotsWithDetailsAsync(int staffId, DateTime date);
        Task<List<TimeSlotDTO>> GetMedicalStaffBusyTimeSlotsWithDetailsAsync(int medicalStaffId, DateTime date);
        
        // Các phương thức để tính toán thời gian xử lý
        int CalculateMedicalStaffProcessingTime(string serviceName);
        int CalculateStaffProcessingTime(string serviceName);
        
        // Phương thức để tính toán thời gian rảnh
        Task<List<DateTime>> GetAvailableTimeSlotsAsync(List<(DateTime StartTime, int DurationMinutes)> busyTimes, int requiredDuration);
    }
} 