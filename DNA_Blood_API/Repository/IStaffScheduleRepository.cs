using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Repository
{
    public interface IStaffScheduleRepository
    {
        // Các phương thức để kiểm tra thời gian đặt lịch cụ thể
        Task<bool> IsBookingTimeAvailableAsync(int medicalStaffId, DateTime bookingTime, int requiredDuration);
        Task<bool> IsStaffBookingTimeAvailableAsync(int staffId, DateTime bookingTime, int requiredDuration);
        
        // Các phương thức để cân bằng tải với giới hạn đơn hàng/ngày
        Task<List<User>> GetAvailableMedicalStaffWithWorkloadBalancingAsync(string serviceName, int requiredDuration, DateTime date, int maxOrdersPerDay = 5);
        Task<List<User>> GetAvailableStaffWithWorkloadBalancingAsync(int requiredDuration, DateTime date, int maxOrdersPerDay = 5);
        Task<int> GetMedicalStaffDailyOrderCountAsync(int medicalStaffId, DateTime date);
        Task<int> GetStaffDailyOrderCountAsync(int staffId, DateTime date);
        
        // Các phương thức để lấy thời gian bận
        Task<List<(DateTime StartTime, int DurationMinutes)>> GetStaffBusyTimeWithDurationAsync(int staffId, DateTime date);
        Task<List<(DateTime StartTime, int DurationMinutes)>> GetMedicalStaffBusyTimeWithDurationAsync(int medicalStaffId, DateTime date);
        
        // Các phương thức để tính toán thời gian xử lý
        int CalculateMedicalStaffProcessingTime(string serviceName);
        int CalculateStaffProcessingTime(string serviceName);
    }
} 