using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class StaffScheduleRepository : RepositoryBase<Order>, IStaffScheduleRepository
    {
        public StaffScheduleRepository(BloodlineDnaContext context) : base(context) { }

        public async Task<List<User>> GetAvailableMedicalStaffWithScheduleAsync(string serviceName, int requiredDuration)
        {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            // Lấy tất cả medical staff có chuyên môn phù hợp
            var allMedicalStaff = await _context.Users
                .Include(u => u.UserProfile)
                .Where(u => u.RoleId == 4 && u.UserProfile.YearsOfExperience >= 2)
                .ToListAsync();

            var availableStaff = new List<User>();

            foreach (var staff in allMedicalStaff)
            {
                // Kiểm tra xem staff có chuyên môn phù hợp không
                bool hasMatchingSpecialization = string.IsNullOrEmpty(serviceName) || 
                    (staff.UserProfile.Specialization != null && 
                     serviceName.Contains(staff.UserProfile.Specialization));

                if (hasMatchingSpecialization)
                {
                    // Kiểm tra xem staff có thời gian rảnh không
                    var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(staff.UserId, today);
                    var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration);
                    
                    if (availableSlots.Any())
                    {
                        availableStaff.Add(staff);
                    }
                }
            }

            // Nếu không tìm thấy staff có chuyên môn phù hợp, tìm bất kỳ staff nào có thời gian rảnh
            if (!availableStaff.Any())
            {
                foreach (var staff in allMedicalStaff)
                {
                    var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(staff.UserId, today);
                    var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration);
                    
                    if (availableSlots.Any())
                    {
                        availableStaff.Add(staff);
                    }
                }
            }

            return availableStaff;
        }

        public async Task<List<User>> GetAvailableStaffWithScheduleAsync(int requiredDuration)
        {
            var today = DateTime.Today;
            var allStaff = await _context.Users
                .Where(u => u.RoleId == 2)
                .ToListAsync();

            var availableStaff = new List<User>();

            foreach (var staff in allStaff)
            {
                var busyTimes = await GetStaffBusyTimeWithDurationAsync(staff.UserId, today);
                var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration);
                
                if (availableSlots.Any())
                {
                    availableStaff.Add(staff);
                }
            }

            return availableStaff;
        }

        public async Task<bool> IsStaffAvailableAtTimeAsync(int staffId, DateTime startTime, int durationMinutes)
        {
            var endTime = startTime.AddMinutes(durationMinutes);
            var busyTimes = await GetStaffBusyTimeWithDurationAsync(staffId, startTime.Date);
            
            foreach (var (busyStart, busyDuration) in busyTimes)
            {
                var busyEndTime = busyStart.AddMinutes(busyDuration);
                
                // Kiểm tra xung đột thời gian
                if (startTime < busyEndTime && endTime > busyStart)
                {
                    return false; // Có xung đột thời gian
                }
            }
            
            return true;
        }

        public async Task<bool> IsMedicalStaffAvailableAtTimeAsync(int medicalStaffId, DateTime startTime, int durationMinutes)
        {
            var endTime = startTime.AddMinutes(durationMinutes);
            var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, startTime.Date);
            
            foreach (var (busyStart, busyDuration) in busyTimes)
            {
                var busyEndTime = busyStart.AddMinutes(busyDuration);
                
                // Kiểm tra xung đột thời gian
                if (startTime < busyEndTime && endTime > busyStart)
                {
                    return false; // Có xung đột thời gian
                }
            }
            
            return true;
        }

        public async Task<List<DateTime>> GetStaffBusyTimeSlotsAsync(int staffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            // Lấy tất cả các mẫu mà staff này phụ trách trong ngày
            var samples = await _context.Samples
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.ServicePackage)
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Where(s => s.StaffId == staffId &&
                           s.OrderDetail.Order.CreateAt >= date &&
                           s.OrderDetail.Order.CreateAt < nextDay)
                .ToListAsync();

            var busySlots = new List<DateTime>();
            
            foreach (var sample in samples)
            {
                var orderTime = sample.OrderDetail.Order.CreateAt ?? DateTime.Now;
                
                // Tạo slot bận với thời gian thực tế (không chia thành slot 30 phút)
                // Chỉ tạo 1 slot bận từ thời điểm bắt đầu đến khi hoàn thành
                busySlots.Add(orderTime);
            }
            
            return busySlots;
        }

        public async Task<List<DateTime>> GetMedicalStaffBusyTimeSlotsAsync(int medicalStaffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            // Lấy tất cả các order detail mà medical staff này phụ trách trong ngày
            var orderDetails = await _context.OrderDetails
                .Include(od => od.ServicePackage)
                .Include(od => od.Order)
                .Where(od => od.MedicalStaffId == medicalStaffId &&
                           od.Order.CreateAt >= date &&
                           od.Order.CreateAt < nextDay)
                .ToListAsync();

            var busySlots = new List<DateTime>();
            
            foreach (var orderDetail in orderDetails)
            {
                var orderTime = orderDetail.Order.CreateAt ?? DateTime.Now;
                
                // Tạo slot bận với thời gian thực tế (không chia thành slot 30 phút)
                // Chỉ tạo 1 slot bận từ thời điểm bắt đầu đến khi hoàn thành
                busySlots.Add(orderTime);
            }
            
            return busySlots;
        }

        public async Task<List<(DateTime StartTime, int DurationMinutes)>> GetStaffBusyTimeWithDurationAsync(int staffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            var samples = await _context.Samples
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.ServicePackage)
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Where(s => s.StaffId == staffId &&
                           s.OrderDetail.Order.CreateAt >= date &&
                           s.OrderDetail.Order.CreateAt < nextDay)
                .ToListAsync();

            var busyTimes = new List<(DateTime StartTime, int DurationMinutes)>();
            
            foreach (var sample in samples)
            {
                var orderTime = sample.OrderDetail.Order.CreateAt ?? DateTime.Now;
                var serviceName = sample.OrderDetail.ServicePackage?.ServiceName ?? "";
                var staffProcessingTime = CalculateStaffProcessingTime(serviceName);
                
                busyTimes.Add((orderTime, staffProcessingTime));
            }
            
            return busyTimes;
        }

        public async Task<List<(DateTime StartTime, int DurationMinutes)>> GetMedicalStaffBusyTimeWithDurationAsync(int medicalStaffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            var orderDetails = await _context.OrderDetails
                .Include(od => od.ServicePackage)
                .Include(od => od.Order)
                .Where(od => od.MedicalStaffId == medicalStaffId &&
                           od.Order.CreateAt >= date &&
                           od.Order.CreateAt < nextDay)
                .ToListAsync();

            var busyTimes = new List<(DateTime StartTime, int DurationMinutes)>();
            
            foreach (var orderDetail in orderDetails)
            {
                var orderTime = orderDetail.Order.CreateAt ?? DateTime.Now;
                var serviceName = orderDetail.ServicePackage?.ServiceName ?? "";
                var medicalStaffProcessingTime = CalculateMedicalStaffProcessingTime(serviceName);
                
                busyTimes.Add((orderTime, medicalStaffProcessingTime));
            }
            
            return busyTimes;
        }

        public async Task<StaffScheduleDTO?> GetStaffScheduleDetailAsync(int staffId, DateTime date)
        {
            var staff = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == staffId);

            if (staff == null) return null;

            var busySlots = await GetStaffBusyTimeSlotsWithDetailsAsync(staffId, date);
            var busyTimes = await GetStaffBusyTimeWithDurationAsync(staffId, date);
            var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, 30);

            return new StaffScheduleDTO
            {
                StaffId = staffId,
                StaffName = staff.Name ?? "Unknown",
                Role = staff.Role?.RoleName ?? "Unknown",
                Date = date,
                AvailableSlots = availableSlots.Select(slot => new TimeSlotDTO
                {
                    StartTime = slot,
                    EndTime = slot.AddMinutes(30),
                    DurationMinutes = 30,
                    Status = "Available"
                }).ToList(),
                BusySlots = busySlots,
                TotalAvailableMinutes = availableSlots.Count * 30,
                TotalBusyMinutes = busySlots.Sum(slot => slot.DurationMinutes)
            };
        }

        public async Task<StaffScheduleDTO?> GetMedicalStaffScheduleDetailAsync(int medicalStaffId, DateTime date)
        {
            var staff = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == medicalStaffId);

            if (staff == null) return null;

            var busySlots = await GetMedicalStaffBusyTimeSlotsWithDetailsAsync(medicalStaffId, date);
            var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, date);
            var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, 30);

            return new StaffScheduleDTO
            {
                StaffId = medicalStaffId,
                StaffName = staff.Name ?? "Unknown",
                Role = staff.Role?.RoleName ?? "Unknown",
                Date = date,
                AvailableSlots = availableSlots.Select(slot => new TimeSlotDTO
                {
                    StartTime = slot,
                    EndTime = slot.AddMinutes(30),
                    DurationMinutes = 30,
                    Status = "Available"
                }).ToList(),
                BusySlots = busySlots,
                TotalAvailableMinutes = availableSlots.Count * 30,
                TotalBusyMinutes = busySlots.Sum(slot => slot.DurationMinutes)
            };
        }

        public async Task<List<TimeSlotDTO>> GetStaffBusyTimeSlotsWithDetailsAsync(int staffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            var samples = await _context.Samples
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.ServicePackage)
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Where(s => s.StaffId == staffId &&
                           s.OrderDetail.Order.CreateAt >= date &&
                           s.OrderDetail.Order.CreateAt < nextDay)
                .ToListAsync();

            var busySlots = new List<TimeSlotDTO>();
            
            foreach (var sample in samples)
            {
                var orderTime = sample.OrderDetail.Order.CreateAt ?? DateTime.Now;
                var serviceName = sample.OrderDetail.ServicePackage?.ServiceName ?? "";
                var staffProcessingTime = CalculateStaffProcessingTime(serviceName);
                
                busySlots.Add(new TimeSlotDTO
                {
                    StartTime = orderTime,
                    EndTime = orderTime.AddMinutes(staffProcessingTime),
                    DurationMinutes = staffProcessingTime,
                    Status = "Busy",
                    OrderId = sample.OrderDetail.Order.OrderId.ToString(),
                    ServiceName = sample.OrderDetail.ServicePackage?.ServiceName
                });
            }
            
            return busySlots;
        }

        public async Task<List<TimeSlotDTO>> GetMedicalStaffBusyTimeSlotsWithDetailsAsync(int medicalStaffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            var orderDetails = await _context.OrderDetails
                .Include(od => od.ServicePackage)
                .Include(od => od.Order)
                .Where(od => od.MedicalStaffId == medicalStaffId &&
                           od.Order.CreateAt >= date &&
                           od.Order.CreateAt < nextDay)
                .ToListAsync();

            var busySlots = new List<TimeSlotDTO>();
            
            foreach (var orderDetail in orderDetails)
            {
                var orderTime = orderDetail.Order.CreateAt ?? DateTime.Now;
                var serviceName = orderDetail.ServicePackage?.ServiceName ?? "";
                var medicalStaffProcessingTime = CalculateMedicalStaffProcessingTime(serviceName);
                
                busySlots.Add(new TimeSlotDTO
                {
                    StartTime = orderTime,
                    EndTime = orderTime.AddMinutes(medicalStaffProcessingTime),
                    DurationMinutes = medicalStaffProcessingTime,
                    Status = "Busy",
                    OrderId = orderDetail.Order.OrderId.ToString(),
                    ServiceName = orderDetail.ServicePackage?.ServiceName
                });
            }
            
            return busySlots;
        }

        /// <summary>
        /// Tính toán thời gian làm việc thực tế của medical staff dựa trên loại dịch vụ
        /// </summary>
        public int CalculateMedicalStaffProcessingTime(string serviceName)
        {
            var serviceNameLower = serviceName.ToLower();
            
            if (serviceNameLower.Contains("paternity") || serviceNameLower.Contains("cha"))
            {
                return 180; // 3 giờ cho xét nghiệm cha con
            }
            else if (serviceNameLower.Contains("ancestry") || serviceNameLower.Contains("tổ tiên"))
            {
                return 150; // 2.5 giờ cho xét nghiệm tổ tiên
            }
            else if (serviceNameLower.Contains("health") || serviceNameLower.Contains("sức khỏe"))
            {
                return 120; // 2 giờ cho xét nghiệm sức khỏe
            }
            else if (serviceNameLower.Contains("carrier") || serviceNameLower.Contains("mang gen"))
            {
                return 90; // 1.5 giờ cho xét nghiệm mang gen
            }
            else
            {
                return 120; // Mặc định 2 giờ
            }
        }

        /// <summary>
        /// Tính toán thời gian làm việc thực tế của staff thông thường dựa trên loại dịch vụ
        /// </summary>
        public int CalculateStaffProcessingTime(string serviceName)
        {
            var serviceNameLower = serviceName.ToLower();
            
            if (serviceNameLower.Contains("paternity") || serviceNameLower.Contains("cha"))
            {
                return 60; // 1 giờ cho xét nghiệm cha con
            }
            else if (serviceNameLower.Contains("ancestry") || serviceNameLower.Contains("tổ tiên"))
            {
                return 45; // 45 phút cho xét nghiệm tổ tiên
            }
            else if (serviceNameLower.Contains("health") || serviceNameLower.Contains("sức khỏe"))
            {
                return 30; // 30 phút cho xét nghiệm sức khỏe
            }
            else if (serviceNameLower.Contains("carrier") || serviceNameLower.Contains("mang gen"))
            {
                return 30; // 30 phút cho xét nghiệm mang gen
            }
            else
            {
                return 45; // Mặc định 45 phút
            }
        }

        // Method mới để lấy thời gian rảnh với thông tin chi tiết
        private List<DateTime> GetAvailableTimeSlotsWithDetailedBusyTimes(List<(DateTime StartTime, int DurationMinutes)> busyTimes, int requiredDuration)
        {
            var availableSlots = new List<DateTime>();
            var workStartHour = 8; // Giờ làm việc bắt đầu
            var workEndHour = 17; // Giờ làm việc kết thúc
            var today = DateTime.Today;
            
            // Tạo các slot thời gian trong ngày làm việc
            for (int hour = workStartHour; hour < workEndHour; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30) // Chia thành các slot 30 phút để kiểm tra
                {
                    var slotTime = today.AddHours(hour).AddMinutes(minute);
                    
                    // Kiểm tra xem có thể bắt đầu công việc tại thời điểm này không
                    bool canStart = true;
                    
                    // Kiểm tra xem có đủ thời gian liên tục không
                    for (int i = 0; i < requiredDuration; i += 30)
                    {
                        var checkTime = slotTime.AddMinutes(i);
                        if (checkTime.Hour >= workEndHour)
                        {
                            canStart = false;
                            break;
                        }
                    }
                    
                    if (canStart)
                    {
                        // Kiểm tra xem có xung đột với các công việc bận không
                        foreach (var (busyStart, busyDuration) in busyTimes)
                        {
                            var busyEndTime = busyStart.AddMinutes(busyDuration);
                            
                            if (slotTime < busyEndTime && slotTime.AddMinutes(requiredDuration) > busyStart)
                            {
                                canStart = false;
                                break;
                            }
                        }
                    }
                    
                    if (canStart)
                    {
                        availableSlots.Add(slotTime);
                    }
                }
            }
            
            return availableSlots;
        }
    }
} 