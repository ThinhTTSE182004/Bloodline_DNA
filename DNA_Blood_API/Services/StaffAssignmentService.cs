using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_Blood_API.Repository;
using DNA_Blood_API.Services;

namespace DNA_API1.Services
{
    public class StaffAssignmentService : IStaffAssignmentService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IStaffScheduleRepository _staffScheduleRepository;
        private readonly IRepository<WorkShift> _workShiftRepository;
        private readonly IRepository<ShiftAssignment> _shiftAssignmentRepository;
        private readonly IUserRepository _userRepository;

        public StaffAssignmentService(IOrderRepository orderRepository, IStaffScheduleRepository staffScheduleRepository, IRepository<WorkShift> workShiftRepository, IRepository<ShiftAssignment> shiftAssignmentRepository, IUserRepository userRepository)
        {
            _orderRepository = orderRepository;
            _staffScheduleRepository = staffScheduleRepository;
            _workShiftRepository = workShiftRepository;
            _shiftAssignmentRepository = shiftAssignmentRepository;
            _userRepository = userRepository;
        }

        public async Task<WorkShift?> GetWorkShiftForBookingTime(DateTime bookingDate)
        {
            var bookingTime = TimeOnly.FromTimeSpan(bookingDate.TimeOfDay);
            var workShifts = await _workShiftRepository.GetAllAsync();
            return workShifts.FirstOrDefault(ws => ws.StartTime <= bookingTime && bookingTime < ws.EndTime);
        }

        public async Task<(int medicalStaffId, int staffId)> AutoAssignStaffAndMedicalForOrderAsync(
            DateTime bookingDate,
            string serviceName,
            int medicalProcessingTime,
            int staffProcessingTime
        )
        {
            // 1. Xác định ca từ BookingDate
            var workShift = await GetWorkShiftForBookingTime(bookingDate);
            var shiftId = workShift.ShiftId;
            var assignmentDate = DateOnly.FromDateTime(bookingDate);

            // 2. Lấy danh sách nhân viên đã gán ca/ngày
            var assignments = await _shiftAssignmentRepository.FindAsync(sa => sa.ShiftId == shiftId && sa.AssignmentDate == assignmentDate);
            var userIds = assignments.Select(a => a.UserId).ToList();
            var users = await _userRepository.FindAsync(u => userIds.Contains(u.UserId));

            // --- Medical Staff ---
            var medicalUsers = users.Where(u => u.RoleId == 4).ToList();
            var suitableMedical = medicalUsers.Where(u => u.UserProfile != null && !string.IsNullOrEmpty(u.UserProfile.Specialization) && serviceName.Contains(u.UserProfile.Specialization)).ToList();
            if (!suitableMedical.Any())
            {
                // Nếu không có ai chuyên môn phù hợp, lấy người có năm kinh nghiệm cao nhất
                if (medicalUsers.Any())
                {
                    var maxExp = medicalUsers.Max(u => u.UserProfile?.YearsOfExperience ?? 0);
                    suitableMedical = medicalUsers.Where(u => (u.UserProfile?.YearsOfExperience ?? 0) == maxExp).ToList();
                }
                else
                {
                    // Không có medicalUsers nào, suitableMedical sẽ để rỗng
                    suitableMedical = new List<User>();
                }
            }
            var availableMedical = new List<User>();
            foreach (var u in suitableMedical)
            {
                bool isFree = await _staffScheduleRepository.IsBookingTimeAvailableAsync(u.UserId, bookingDate, medicalProcessingTime);
                if (isFree)
                    availableMedical.Add(u);
            }
            int medicalStaffId = 0;
            if (availableMedical.Any())
            {
                var month = bookingDate.Month;
                var minOrder = availableMedical.Min(u => assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == month));
                var leastAssigned = availableMedical.Where(u => assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == month) == minOrder).ToList();
                var rand = new Random();
                medicalStaffId = leastAssigned[rand.Next(leastAssigned.Count)].UserId;
            }

            // --- Staff ---
            var staffUsers = users.Where(u => u.RoleId == 2).ToList();
            var availableStaff = new List<User>();
            foreach (var u in staffUsers)
            {
                bool isFree = await _staffScheduleRepository.IsStaffBookingTimeAvailableAsync(u.UserId, bookingDate, staffProcessingTime);
                if (isFree)
                    availableStaff.Add(u);
            }
            int staffId = 0;
            if (availableStaff.Any())
            {
                var month = bookingDate.Month;
                var minOrder = availableStaff.Min(u => assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == month));
                var leastAssigned = availableStaff.Where(u => assignments.Count(a => a.UserId == u.UserId && a.AssignmentDate.Month == month) == minOrder).ToList();
                var rand = new Random();
                staffId = leastAssigned[rand.Next(leastAssigned.Count)].UserId;
            }

            return (medicalStaffId, staffId);
        }
    }
} 