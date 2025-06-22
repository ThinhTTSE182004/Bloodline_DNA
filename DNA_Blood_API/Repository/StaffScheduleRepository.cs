using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class StaffScheduleRepository : RepositoryBase<Order>, IStaffScheduleRepository
    {
        public StaffScheduleRepository(BloodlineDnaContext context) : base(context) { }

        public async Task<bool> IsBookingTimeAvailableAsync(int medicalStaffId, DateTime bookingTime, int requiredDuration)
        {
            var targetDate = bookingTime.Date;
            var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, targetDate);
            
            var bookingEndTime = bookingTime.AddMinutes(requiredDuration);
            
            foreach (var (busyStart, busyDuration) in busyTimes)
            {
                var busyEndTime = busyStart.AddMinutes(busyDuration);
                
                // Kiểm tra xung đột thời gian
                bool hasOverlap = (bookingTime < busyEndTime && bookingEndTime > busyStart);
                
                if (hasOverlap)
                {
                    return false;
                }
            }
            
            return true;
        }

        public async Task<bool> IsStaffBookingTimeAvailableAsync(int staffId, DateTime bookingTime, int requiredDuration)
        {
            var targetDate = bookingTime.Date;
            var busyTimes = await GetStaffBusyTimeWithDurationAsync(staffId, targetDate);
            
            var bookingEndTime = bookingTime.AddMinutes(requiredDuration);
            
            foreach (var (busyStart, busyDuration) in busyTimes)
            {
                var busyEndTime = busyStart.AddMinutes(busyDuration);
                
                // Kiểm tra xung đột thời gian
                bool hasOverlap = (bookingTime < busyEndTime && bookingEndTime > busyStart);
                
                if (hasOverlap)
                {
                    return false;
                }
            }
            
            return true;
        }

        public async Task<List<User>> GetAvailableMedicalStaffWithWorkloadBalancingAsync(string serviceName, int requiredDuration, DateTime date, int maxOrdersPerDay = 5)
        {
            var targetDate = date.Date;

            // Lấy tất cả medical staff có chuyên môn phù hợp
            var allMedicalStaff = await _context.Users
                .Include(u => u.UserProfile)
                .Where(u => u.RoleId == 4 && u.UserProfile.YearsOfExperience >= 2)
                .ToListAsync();

            var availableStaff = new List<(User Staff, int CurrentOrders, int AvailableSlots)>();

            foreach (var staff in allMedicalStaff)
            {
                // Kiểm tra xem staff có chuyên môn phù hợp không
                bool hasMatchingSpecialization = string.IsNullOrEmpty(serviceName) || 
                    (staff.UserProfile.Specialization != null && 
                     serviceName.Contains(staff.UserProfile.Specialization));

                if (hasMatchingSpecialization)
                {
                    // Đếm số đơn hàng hiện tại trong ngày
                    var currentOrders = await GetMedicalStaffDailyOrderCountAsync(staff.UserId, targetDate);
                    
                    // Kiểm tra giới hạn 5 đơn/ngày
                    if (currentOrders >= maxOrdersPerDay)
                    {
                        continue;
                    }

                    // Kiểm tra thời gian rảnh
                    var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(staff.UserId, targetDate);
                    var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration, targetDate);
                    
                    if (availableSlots.Any())
                    {
                        availableStaff.Add((staff, currentOrders, availableSlots.Count));
                    }
                }
            }

            // Sắp xếp theo ưu tiên: ít đơn hàng nhất trước
            var sortedStaff = availableStaff
                .OrderBy(x => x.CurrentOrders)  // Ưu tiên người ít đơn nhất
                .ThenByDescending(x => x.AvailableSlots)  // Sau đó ưu tiên người có nhiều slot rảnh
                .Select(x => x.Staff)
                .ToList();

            return sortedStaff;
        }

        public async Task<List<User>> GetAvailableStaffWithWorkloadBalancingAsync(int requiredDuration, DateTime date, int maxOrdersPerDay = 5)
        {
            var targetDate = date.Date;
            var allStaff = await _context.Users
                .Where(u => u.RoleId == 2)
                .ToListAsync();

            var availableStaff = new List<(User Staff, int CurrentOrders, int AvailableSlots)>();

            foreach (var staff in allStaff)
            {
                // Đếm số đơn hàng hiện tại trong ngày
                var currentOrders = await GetStaffDailyOrderCountAsync(staff.UserId, targetDate);
                
                // Kiểm tra giới hạn 5 đơn/ngày
                if (currentOrders >= maxOrdersPerDay)
                {
                    continue;
                }

                // Kiểm tra thời gian rảnh
                var busyTimes = await GetStaffBusyTimeWithDurationAsync(staff.UserId, targetDate);
                var availableSlots = GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration, targetDate);
                
                if (availableSlots.Any())
                {
                    availableStaff.Add((staff, currentOrders, availableSlots.Count));
                }
            }

            // Sắp xếp theo ưu tiên: ít đơn hàng nhất trước
            var sortedStaff = availableStaff
                .OrderBy(x => x.CurrentOrders)  // Ưu tiên người ít đơn nhất
                .ThenByDescending(x => x.AvailableSlots)  // Sau đó ưu tiên người có nhiều slot rảnh
                .Select(x => x.Staff)
                .ToList();

            return sortedStaff;
        }

        public async Task<int> GetMedicalStaffDailyOrderCountAsync(int medicalStaffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            var orderCount = await _context.OrderDetails
                .Include(od => od.Order)
                .Where(od => od.MedicalStaffId == medicalStaffId &&
                           od.Order.BookingDate >= date &&
                           od.Order.BookingDate < nextDay)
                .CountAsync();

            return orderCount;
        }

        public async Task<int> GetStaffDailyOrderCountAsync(int staffId, DateTime date)
        {
            var nextDay = date.AddDays(1);
            
            var orderCount = await _context.Samples
                .Include(s => s.OrderDetail)
                    .ThenInclude(od => od.Order)
                .Where(s => s.StaffId == staffId &&
                           s.OrderDetail.Order.BookingDate >= date &&
                           s.OrderDetail.Order.BookingDate < nextDay)
                .CountAsync();

            return orderCount;
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
                           s.OrderDetail.Order.BookingDate >= date &&
                           s.OrderDetail.Order.BookingDate < nextDay)
                .ToListAsync();

            var busyTimes = new List<(DateTime StartTime, int DurationMinutes)>();
            
            foreach (var sample in samples)
            {
                var orderTime = sample.OrderDetail.Order.BookingDate ?? sample.OrderDetail.Order.CreateAt ?? DateTime.Now;
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
                           od.Order.BookingDate >= date &&
                           od.Order.BookingDate < nextDay)
                .ToListAsync();

            var busyTimes = new List<(DateTime StartTime, int DurationMinutes)>();
            
            foreach (var orderDetail in orderDetails)
            {
                var orderTime = orderDetail.Order.BookingDate ?? orderDetail.Order.CreateAt ?? DateTime.Now;
                var serviceName = orderDetail.ServicePackage?.ServiceName ?? "";
                var medicalStaffProcessingTime = CalculateMedicalStaffProcessingTime(serviceName);
                
                busyTimes.Add((orderTime, medicalStaffProcessingTime));
            }
            
            return busyTimes;
        }

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

        private List<DateTime> GetAvailableTimeSlotsWithDetailedBusyTimes(List<(DateTime StartTime, int DurationMinutes)> busyTimes, int requiredDuration, DateTime targetDate)
        {
            var availableSlots = new List<DateTime>();
            var workStartHour = 8; // Giờ làm việc bắt đầu
            var workEndHour = 17; // Giờ làm việc kết thúc
            var date = targetDate.Date;
            
            // Tạo các slot thời gian trong ngày làm việc
            for (int hour = workStartHour; hour < workEndHour; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30) // Chia thành các slot 30 phút để kiểm tra
                {
                    var slotTime = date.AddHours(hour).AddMinutes(minute);
                    
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
                            var slotEndTime = slotTime.AddMinutes(requiredDuration);
                            
                            // Kiểm tra xung đột thời gian: có overlap không
                            bool hasOverlap = (slotTime < busyEndTime && slotEndTime > busyStart);
                            
                            if (hasOverlap)
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