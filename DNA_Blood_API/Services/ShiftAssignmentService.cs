using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_Blood_API.ViewModels;

namespace DNA_Blood_API.Services
{
    public class ShiftAssignmentService : IShiftAssignmentService
    {
        private readonly IRepository<ShiftAssignment> _shiftAssignmentRepository;
        public ShiftAssignmentService(IRepository<ShiftAssignment> shiftAssignmentRepository)
        {
            _shiftAssignmentRepository = shiftAssignmentRepository;
        }
        public async Task<IEnumerable<ShiftAssignment>> GetAllAsync()
        {
            return await _shiftAssignmentRepository.GetAllAsync();
        }
        public async Task<ShiftAssignment> GetByIdAsync(int id)
        {
            return await _shiftAssignmentRepository.GetByIdAsync(id);
        }
        public async Task<ShiftAssignment> AddAsync(ShiftAssignmentCreateOrUpdateDTO dto)
        {
            // Kiểm tra số lượng user đã gán vào ca/ngày theo role
            // Lấy user từ dto.UserId nếu cần kiểm tra role
            // (Giả sử có thể lấy user từ repository hoặc truyền roleId từ ngoài vào)
            // Ở đây tạm bỏ kiểm tra role để đơn giản hóa
            var entity = new ShiftAssignment
            {
                UserId = dto.UserId,
                ShiftId = dto.ShiftId,
                AssignmentDate = dto.AssignmentDate
            };
            return await _shiftAssignmentRepository.AddAsync(entity);
        }
        public async Task<ShiftAssignment> UpdateAsync(int assignmentId, ShiftAssignmentCreateOrUpdateDTO dto)
        {
            var entity = await _shiftAssignmentRepository.GetByIdAsync(assignmentId);
            if (entity == null) throw new System.Exception("Assignment not found");
            entity.UserId = dto.UserId;
            entity.ShiftId = dto.ShiftId;
            entity.AssignmentDate = dto.AssignmentDate;
            return await _shiftAssignmentRepository.UpdateAsync(entity);
        }
        public async Task DeleteAsync(int id)
        {
            await _shiftAssignmentRepository.DeleteAsync(id);
        }
        public async Task<int> CountAssignedByRoleAsync(int shiftId, System.DateOnly date, int roleId)
        {
            var list = await _shiftAssignmentRepository.FindAsync(sa => sa.ShiftId == shiftId && sa.AssignmentDate == date && sa.User.RoleId == roleId);
            return list.Count();
        }
        public async Task<List<ShiftAssignmentSuggestionDTO>> SuggestAssignments(
            List<ShiftSimpleDTO> shifts,
            List<UserSimpleDTO> users,
            List<DateOnly> dates)
        {
            // Map DTO sang entity đơn giản
            var workShifts = shifts.Select(s => new WorkShift
            {
                ShiftId = s.ShiftId,
                ShiftName = s.ShiftName,
                StartTime = string.IsNullOrEmpty(s.StartTime) ? default : TimeOnly.Parse(s.StartTime),
                EndTime = string.IsNullOrEmpty(s.EndTime) ? default : TimeOnly.Parse(s.EndTime)
            }).ToList();
            var usersEntity = users.Select(u => new User
            {
                UserId = u.UserId,
                Name = u.Name,
                RoleId = u.RoleId
            }).ToList();

            var suggestions = new List<ShiftAssignmentSuggestionDTO>();
            var assignments = (await _shiftAssignmentRepository.GetAllAsync()).ToList();

            // Dictionary để theo dõi số ca đã gợi ý cho mỗi user trong mỗi tháng
            var suggestedCountPerUserPerMonth = new Dictionary<(int UserId, int Year, int Month), int>();

            // Tách nhân viên theo role và sắp xếp theo số ca hiện tại
            var medicalStaffs = usersEntity.Where(u => u.RoleId == 4).ToList();
            var staffs = usersEntity.Where(u => u.RoleId == 2).ToList();

            // Index để thực hiện Round-Robin
            var medicalIndex = 0;
            var staffIndex = 0;

            foreach (var date in dates)
            {
                foreach (var shift in workShifts)
                {
                    // Medical Staff
                    var assignedMedical = assignments
                        .Where(a => a.ShiftId == shift.ShiftId && a.AssignmentDate == date && a.User != null && a.User.RoleId == 4)
                        .ToList();

                    int needMedical = 3 - assignedMedical.Count;
                    for (int i = 0; i < needMedical && medicalStaffs.Count > 0; i++)
                    {
                        // Tìm Medical Staff phù hợp theo Round-Robin
                        var selectedMedical = FindNextAvailableStaff(
                            medicalStaffs, 
                            date, 
                            shift, 
                            assignments, 
                            suggestedCountPerUserPerMonth,
                            ref medicalIndex);

                        if (selectedMedical != null)
                        {
                            // Cập nhật số ca đã gợi ý
                            var key = (selectedMedical.UserId, date.Year, date.Month);
                            if (!suggestedCountPerUserPerMonth.ContainsKey(key))
                                suggestedCountPerUserPerMonth[key] = 0;
                            suggestedCountPerUserPerMonth[key]++;

                            suggestions.Add(new ShiftAssignmentSuggestionDTO
                            {
                                UserId = selectedMedical.UserId,
                                UserName = selectedMedical.Name,
                                RoleId = selectedMedical.RoleId ?? 0,
                                RoleName = "Medical Staff",
                                ShiftId = shift.ShiftId,
                                ShiftName = shift.ShiftName,
                                AssignmentDate = date,
                                AssignedCountInMonth = GetTotalAssignmentsInMonth(selectedMedical.UserId, date, assignments, suggestedCountPerUserPerMonth),
                                IsSuggested = true
                            });
                        }
                    }

                    // Staff
                    var assignedStaff = assignments
                        .Where(a => a.ShiftId == shift.ShiftId && a.AssignmentDate == date && a.User != null && a.User.RoleId == 2)
                        .ToList();

                    int needStaff = 4 - assignedStaff.Count;
                    for (int i = 0; i < needStaff && staffs.Count > 0; i++)
                    {
                        // Tìm Staff phù hợp theo Round-Robin
                        var selectedStaff = FindNextAvailableStaff(
                            staffs, 
                            date, 
                            shift, 
                            assignments, 
                            suggestedCountPerUserPerMonth,
                            ref staffIndex);

                        if (selectedStaff != null)
                        {
                            // Cập nhật số ca đã gợi ý
                            var key = (selectedStaff.UserId, date.Year, date.Month);
                            if (!suggestedCountPerUserPerMonth.ContainsKey(key))
                                suggestedCountPerUserPerMonth[key] = 0;
                            suggestedCountPerUserPerMonth[key]++;

                            suggestions.Add(new ShiftAssignmentSuggestionDTO
                            {
                                UserId = selectedStaff.UserId,
                                UserName = selectedStaff.Name,
                                RoleId = selectedStaff.RoleId ?? 0,
                                RoleName = "Staff",
                                ShiftId = shift.ShiftId,
                                ShiftName = shift.ShiftName,
                                AssignmentDate = date,
                                AssignedCountInMonth = GetTotalAssignmentsInMonth(selectedStaff.UserId, date, assignments, suggestedCountPerUserPerMonth),
                                IsSuggested = true
                            });
                        }
                    }
                }
            }
            return suggestions;
        }

        // Helper method để tính tổng số ca trong tháng (database + gợi ý)
        private int GetTotalAssignmentsInMonth(int userId, DateOnly date, List<ShiftAssignment> assignments, Dictionary<(int UserId, int Year, int Month), int> suggestedCount)
        {
            var dbCount = assignments.Count(a => a.UserId == userId && a.AssignmentDate.Month == date.Month && a.AssignmentDate.Year == date.Year);
            var suggestedCountForUser = suggestedCount.GetValueOrDefault((userId, date.Year, date.Month), 0);
            return dbCount + suggestedCountForUser;
        }

        private User FindNextAvailableStaff(
            List<User> staffs,
            DateOnly date,
            WorkShift shift,
            List<ShiftAssignment> assignments,
            Dictionary<(int UserId, int Year, int Month), int> suggestedCount,
            ref int index)
        {
            if (staffs.Count == 0) return null;

            // Lọc ra những nhân viên có thể làm việc trong ngày này
            var availableStaffs = staffs.Where(s => 
                !assignments.Any(a => a.UserId == s.UserId && a.AssignmentDate == date) &&
                !(shift.ShiftName.ToLower().Contains("Morning") && assignments.Any(a => a.UserId == s.UserId && a.AssignmentDate == date.AddDays(-1) && a.Shift.ShiftName.ToLower().Contains("Afternoon")))
            ).ToList();

            if (availableStaffs.Count == 0) return null;

            // Luôn chọn nhân viên có tổng số ca thấp nhất (database + suggested)
            var selectedStaff = availableStaffs
                .OrderBy(s => GetTotalAssignmentsInMonth(s.UserId, date, assignments, suggestedCount))
                .First();

            return selectedStaff;
        }
    }
} 