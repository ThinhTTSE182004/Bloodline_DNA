using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class StaffScheduleRepository : RepositoryBase<Order>, IStaffScheduleRepository
    {
        // ===== Constructor =====
        public StaffScheduleRepository(BloodlineDnaContext context) : base(context) { }

        // ===== Các hàm public chính =====
        public async Task<bool> IsBookingTimeAvailableAsync(int medicalStaffId, DateTime bookingTime, int requiredDuration)
        {
            var targetDate = bookingTime.Date;
            var busyTimes = await GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, targetDate);
            var bookingEndTime = bookingTime.AddMinutes(requiredDuration);
            foreach (var (busyStart, busyDuration) in busyTimes)
            {
                var busyEndTime = busyStart.AddMinutes(busyDuration);
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
                bool hasOverlap = (bookingTime < busyEndTime && bookingEndTime > busyStart);
                if (hasOverlap)
                {
                    return false;
                }
            }
            return true;
        }

        // ===== Các hàm public phụ trợ =====
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
                var serviceName = sample.OrderDetail.ServicePackage.ServiceName;
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
                var medicalStaffProcessingTime = orderDetail.ServicePackage?.ProcessingTimeMinutes ?? 120;
                busyTimes.Add((orderTime, medicalStaffProcessingTime));
            }
            return busyTimes;
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
    }
} 