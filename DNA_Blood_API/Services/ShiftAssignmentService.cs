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
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly ShiftAssignmentRepository _shiftAssignmentRepositoryCustom;
        public ShiftAssignmentService(
            IRepository<ShiftAssignment> shiftAssignmentRepository,
            IUserRepository userRepository,
            IUserProfileRepository userProfileRepository,
            ShiftAssignmentRepository shiftAssignmentRepositoryCustom)
        {
            _shiftAssignmentRepository = shiftAssignmentRepository;
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
            _shiftAssignmentRepositoryCustom = shiftAssignmentRepositoryCustom;
        }
        // Đã xoá các hàm không còn dùng: GetAllAsync, GetByIdAsync, AddAsync, UpdateAsync
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
                        .Select(a => a.UserId)
                        .ToList();

                    int needMedical = 3 - assignedMedical.Count;
                    for (int i = 0; i < needMedical && medicalStaffs.Count > 0; i++)
                    {
                        var availableMedicalStaffs = medicalStaffs.Where(m => !assignedMedical.Contains(m.UserId)).ToList();
                        var selectedMedical = FindNextAvailableStaff(
                            availableMedicalStaffs, 
                            date, 
                            shift, 
                            assignments, 
                            suggestedCountPerUserPerMonth,
                            ref medicalIndex);

                        if (selectedMedical != null)
                        {
                            assignedMedical.Add(selectedMedical.UserId); // Thêm vào danh sách đã gán
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
                        .Select(a => a.UserId)
                        .ToList();

                    int needStaff = 4 - assignedStaff.Count;
                    for (int i = 0; i < needStaff && staffs.Count > 0; i++)
                    {
                        var availableStaffs = staffs.Where(s => !assignedStaff.Contains(s.UserId)).ToList();
                        var selectedStaff = FindNextAvailableStaff(
                            availableStaffs, 
                            date, 
                            shift, 
                            assignments, 
                            suggestedCountPerUserPerMonth,
                            ref staffIndex);

                        if (selectedStaff != null)
                        {
                            assignedStaff.Add(selectedStaff.UserId); // Thêm vào danh sách đã gán
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

        public async Task<List<MedicalStaffSimpleDTO>> GetMedicalStaffsAsync()
        {
            var medicalStaffs = await _userRepository.FindAsync(u => u.RoleId == 4);
            var result = new List<MedicalStaffSimpleDTO>();
            foreach (var u in medicalStaffs)
            {
                var profile = await _userProfileRepository.GetByUserIdAsync(u.UserId);
                result.Add(new MedicalStaffSimpleDTO
                {
                    UserId = u.UserId,
                    Name = u.Name,
                    RoleId = u.RoleId ?? 0,
                    YearsOfExperience = profile?.YearsOfExperience
                });
            }
            return result;
        }

        public async Task<List<UserSimpleDTO>> GetStaffsAsync()
        {
            var staffs = await _userRepository.FindAsync(u => u.RoleId == 2);
            return staffs.Select(u => new UserSimpleDTO
            {
                UserId = u.UserId,
                Name = u.Name,
                RoleId = u.RoleId ?? 0
            }).ToList();
        }

        public async Task<List<WorkShiftAssignmentDTO>> GetWorkShiftsByUserAndMonthAsync(int userId, int month, int year)
        {
            return await _shiftAssignmentRepositoryCustom.GetWorkShiftsByUserAndMonthAsync(userId, month, year);
        }

        // Trả về danh sách DTO
        public async Task<IEnumerable<ShiftAssignmentDTO>> GetAllDTOAsync()
        {
            var list = await _shiftAssignmentRepository.GetAllAsync();
            return list.Select(sa => new ShiftAssignmentDTO
            {
                AssignmentId = sa.AssignmentId,
                UserId = sa.UserId,
                ShiftId = sa.ShiftId,
                AssignmentDate = sa.AssignmentDate
            });
        }
        // Trả về 1 DTO theo id
        public async Task<ShiftAssignmentDTO> GetByIdDTOAsync(int id)
        {
            var sa = await _shiftAssignmentRepository.GetByIdAsync(id);
            if (sa == null) return null;
            return new ShiftAssignmentDTO
            {
                AssignmentId = sa.AssignmentId,
                UserId = sa.UserId,
                ShiftId = sa.ShiftId,
                AssignmentDate = sa.AssignmentDate
            };
        }
        // Thêm mới và trả về DTO
        public async Task<ShiftAssignmentDTO> AddDTOAsync(ShiftAssignmentCreateOrUpdateDTO dto)
        {
            // Lấy user để kiểm tra role
            var user = await _userRepository.GetByIdAsync(dto.UserId);
            if (user == null)
                throw new System.Exception("User not found");
            int roleId = user.RoleId ?? 0;

            // Get assignments for this shift, date, and role
            var assignments = await _shiftAssignmentRepository.FindAsync(sa => sa.ShiftId == dto.ShiftId && sa.AssignmentDate == dto.AssignmentDate && sa.User.RoleId == roleId);
            // Check duplicate user first
            var exists = assignments.Any(a => a.UserId == dto.UserId);
            if (exists)
                throw new System.Exception("This user has already been assigned to this shift!");

            // Then check max allowed
            int maxAllowed = (roleId == 4) ? 3 : (roleId == 2) ? 4 : int.MaxValue;
            if (assignments.Count() >= maxAllowed)
                throw new System.Exception($"The maximum number of {(roleId == 4 ? "Medical Staff" : roleId == 2 ? "Staff" : "employees")} for this shift has been reached!");

            var entity = new ShiftAssignment
            {
                UserId = dto.UserId,
                ShiftId = dto.ShiftId,
                AssignmentDate = dto.AssignmentDate
            };
            var sa = await _shiftAssignmentRepository.AddAsync(entity);

            return new ShiftAssignmentDTO
            {
                AssignmentId = sa.AssignmentId,
                UserId = sa.UserId,
                ShiftId = sa.ShiftId,
                AssignmentDate = sa.AssignmentDate
            };
        }
        // Cập nhật và trả về DTO
        public async Task<ShiftAssignmentDTO> UpdateDTOAsync(int assignmentId, ShiftAssignmentCreateOrUpdateDTO dto)
        {
            var entity = await _shiftAssignmentRepository.GetByIdAsync(assignmentId);
            if (entity == null) throw new System.Exception("Assignment not found");
            entity.UserId = dto.UserId;
            entity.ShiftId = dto.ShiftId;
            entity.AssignmentDate = dto.AssignmentDate;
            var sa = await _shiftAssignmentRepository.UpdateAsync(entity);
            return new ShiftAssignmentDTO
            {
                AssignmentId = sa.AssignmentId,
                UserId = sa.UserId,
                ShiftId = sa.ShiftId,
                AssignmentDate = sa.AssignmentDate
            };
        }
    }
} 