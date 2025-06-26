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
            List<DateOnly> dates,
            int maxShiftPerMonth = 20)
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
            var rand = new Random();

            foreach (var date in dates)
            {
                foreach (var shift in workShifts)
                {
                    // Medical Staff
                    var medicalStaffs = usersEntity.Where(u => u.RoleId == 4).ToList();
                    var assignedMedical = assignments.Where(a => a.ShiftId == shift.ShiftId && a.AssignmentDate == date && a.User.RoleId == 4).ToList();
                    int needMedical = 3 - assignedMedical.Count;
                    var availableMedical = medicalStaffs.Where(u =>
                        !assignments.Any(a => a.UserId == u.UserId && a.AssignmentDate == date)
                        && !(shift.ShiftName.ToLower().Contains("Morning") && assignments.Any(a => a.UserId == u.UserId && a.AssignmentDate == date.AddDays(-1) && a.Shift.ShiftName.ToLower().Contains("Afternoon")))
                        && assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == date.Month) < maxShiftPerMonth
                    ).OrderBy(u => assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == date.Month)).ToList();
                    var selectedMedical = availableMedical.OrderBy(x => rand.Next()).Take(needMedical);
                    foreach (var u in selectedMedical)
                    {
                        suggestions.Add(new ShiftAssignmentSuggestionDTO
                        {
                            UserId = u.UserId,
                            UserName = u.Name,
                            RoleId = u.RoleId ?? 0,
                            RoleName = "Medical Staff",
                            ShiftId = shift.ShiftId,
                            ShiftName = shift.ShiftName,
                            AssignmentDate = date,
                            AssignedCountInMonth = assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == date.Month),
                            IsSuggested = true
                        });
                    }

                    // Staff
                    var staffs = usersEntity.Where(u => u.RoleId == 2).ToList();
                    var assignedStaff = assignments.Where(a => a.ShiftId == shift.ShiftId && a.AssignmentDate == date && a.User.RoleId == 2).ToList();
                    int needStaff = 4 - assignedStaff.Count;
                    var availableStaff = staffs.Where(u =>
                        !assignments.Any(a => a.UserId == u.UserId && a.AssignmentDate == date)
                        && !(shift.ShiftName.ToLower().Contains("Morning") && assignments.Any(a => a.UserId == u.UserId && a.AssignmentDate == date.AddDays(-1) && a.Shift.ShiftName.ToLower().Contains("Afternoon")))
                        && assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == date.Month) < maxShiftPerMonth
                    ).OrderBy(u => assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == date.Month)).ToList();
                    var selectedStaff = availableStaff.OrderBy(x => rand.Next()).Take(needStaff);
                    foreach (var u in selectedStaff)
                    {
                        suggestions.Add(new ShiftAssignmentSuggestionDTO
                        {
                            UserId = u.UserId,
                            UserName = u.Name,
                            RoleId = u.RoleId ?? 0,
                            RoleName = "Staff",
                            ShiftId = shift.ShiftId,
                            ShiftName = shift.ShiftName,
                            AssignmentDate = date,
                            AssignedCountInMonth = assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == date.Month),
                            IsSuggested = true
                        });
                    }
                }
            }
            return suggestions;
        }
    }
} 