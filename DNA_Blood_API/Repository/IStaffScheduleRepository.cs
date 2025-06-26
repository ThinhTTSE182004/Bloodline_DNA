using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IStaffScheduleRepository
    {
        // Các phương thức để kiểm tra thời gian đặt lịch cụ thể
        Task<bool> IsBookingTimeAvailableAsync(int medicalStaffId, DateTime bookingTime, int requiredDuration);
        Task<bool> IsStaffBookingTimeAvailableAsync(int staffId, DateTime bookingTime, int requiredDuration);
        
        // Các phương thức để lấy thời gian bận
        Task<List<(DateTime StartTime, int DurationMinutes)>> GetStaffBusyTimeWithDurationAsync(int staffId, DateTime date);
        Task<List<(DateTime StartTime, int DurationMinutes)>> GetMedicalStaffBusyTimeWithDurationAsync(int medicalStaffId, DateTime date);

        int CalculateStaffProcessingTime(string serviceName);

    }
} 