using DNA_API1.Models;

namespace DNA_API1.Services
{
    public interface IStaffAssignmentService
    {
        Task<(int medicalStaffId, int staffId)> AssignStaffAsync(int servicePackageId);
    }
} 