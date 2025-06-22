namespace DNA_API1.Services
{
    public interface IStaffAssignmentService
    {
        Task<(int medicalStaffId, int staffId)> AssignStaffAsync(int servicePackageId);
        
        // Các phương thức mới để quản lý lịch trình
        Task<List<DateTime>> GetAvailableTimeSlotsForStaffAsync(int staffId, DateTime date, int requiredDuration);
        Task<List<DateTime>> GetAvailableTimeSlotsForMedicalStaffAsync(int medicalStaffId, DateTime date, int requiredDuration);
        Task<bool> CheckStaffAvailabilityAsync(int staffId, DateTime startTime, int durationMinutes);
        Task<bool> CheckMedicalStaffAvailabilityAsync(int medicalStaffId, DateTime startTime, int durationMinutes);
    }
} 