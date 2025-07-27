using System.Collections.Generic;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_Blood_API.ViewModels;

namespace DNA_Blood_API.Services
{
    public interface IShiftAssignmentService
    {
        Task<IEnumerable<ShiftAssignmentDTO>> GetAllDTOAsync();
        Task<ShiftAssignmentDTO> GetByIdDTOAsync(int id);
        Task<ShiftAssignmentDTO> AddDTOAsync(ShiftAssignmentCreateOrUpdateDTO dto);
        Task<ShiftAssignmentDTO> UpdateDTOAsync(int assignmentId, ShiftAssignmentCreateOrUpdateDTO dto);
        Task DeleteAsync(int id);
        Task<int> CountAssignedByRoleAsync(int shiftId, System.DateOnly date, int roleId);
        Task<List<ShiftAssignmentSuggestionDTO>> SuggestAssignments(List<ShiftSimpleDTO> shifts, List<UserSimpleDTO> users, List<System.DateOnly> dates);

        Task<List<MedicalStaffSimpleDTO>> GetMedicalStaffsAsync();
        Task<List<UserSimpleDTO>> GetStaffsAsync();
        Task<List<WorkShiftAssignmentDTO>> GetWorkShiftsByUserAndMonthAsync(int userId, int month, int year);
    }

    public class ShiftAssignmentCreateOrUpdateDTO
    {
        public int UserId { get; set; }
        public int ShiftId { get; set; }
        public System.DateOnly AssignmentDate { get; set; }
    }
} 