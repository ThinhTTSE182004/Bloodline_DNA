using DNA_API1.Models;
using DNA_API1.Repository;

namespace DNA_API1.Services
{
    public class StaffAssignmentHelperService
    {
        private readonly IStaffScheduleRepository _staffScheduleRepository;

        public StaffAssignmentHelperService(IStaffScheduleRepository staffScheduleRepository)
        {
            _staffScheduleRepository = staffScheduleRepository;
        }

        public async Task<List<User>> GetAvailableMedicalStaffWithCriteriaAsync(string serviceName, DateTime date, int maxOrdersPerDay = 5)
        {
            // Sử dụng logic từ StaffAssignmentService
            var medicalStaffProcessingTime = _staffScheduleRepository.CalculateMedicalStaffProcessingTime(serviceName);
            
            return await _staffScheduleRepository.GetAvailableMedicalStaffWithWorkloadBalancingAsync(
                serviceName,
                medicalStaffProcessingTime,
                date,
                maxOrdersPerDay
            );
        }

        public async Task<List<User>> GetAvailableStaffWithCriteriaAsync(DateTime date, int maxOrdersPerDay = 5)
        {
            // Sử dụng logic từ StaffAssignmentService với thời gian mặc định
            var defaultProcessingTime = 60; // 1 giờ mặc định
            
            return await _staffScheduleRepository.GetAvailableStaffWithWorkloadBalancingAsync(
                defaultProcessingTime, 
                date, 
                maxOrdersPerDay
            );
        }

        public async Task<bool> IsMedicalStaffAvailableForTimeAsync(int medicalStaffId, DateTime bookingTime, string serviceName)
        {
            var processingTime = _staffScheduleRepository.CalculateMedicalStaffProcessingTime(serviceName);
            return await _staffScheduleRepository.IsBookingTimeAvailableAsync(
                medicalStaffId, 
                bookingTime, 
                processingTime
            );
        }

        public async Task<bool> IsStaffAvailableForTimeAsync(int staffId, DateTime bookingTime, string serviceName)
        {
            var processingTime = _staffScheduleRepository.CalculateStaffProcessingTime(serviceName);
            return await _staffScheduleRepository.IsStaffBookingTimeAvailableAsync(
                staffId, 
                bookingTime, 
                processingTime
            );
        }

        public async Task<int> GetMedicalStaffDailyOrderCountAsync(int medicalStaffId, DateTime date)
        {
            return await _staffScheduleRepository.GetMedicalStaffDailyOrderCountAsync(medicalStaffId, date);
        }

        public async Task<int> GetStaffDailyOrderCountAsync(int staffId, DateTime date)
        {
            return await _staffScheduleRepository.GetStaffDailyOrderCountAsync(staffId, date);
        }

        public async Task<List<(DateTime StartTime, int DurationMinutes)>> GetMedicalStaffBusyTimesAsync(int medicalStaffId, DateTime date)
        {
            return await _staffScheduleRepository.GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, date);
        }

        public async Task<List<(DateTime StartTime, int DurationMinutes)>> GetStaffBusyTimesAsync(int staffId, DateTime date)
        {
            return await _staffScheduleRepository.GetStaffBusyTimeWithDurationAsync(staffId, date);
        }

        public int GetMedicalStaffProcessingTime(string serviceName)
        {
            return _staffScheduleRepository.CalculateMedicalStaffProcessingTime(serviceName);
        }

        public int GetStaffProcessingTime(string serviceName)
        {
            return _staffScheduleRepository.CalculateStaffProcessingTime(serviceName);
        }

        public List<DateTime> CalculateAvailableTimeSlots(List<(DateTime StartTime, int DurationMinutes)> busyTimes, int requiredDuration, DateTime targetDate)
        {
            var availableSlots = new List<DateTime>();
            var workStartHour = 8;
            var workEndHour = 17;
            var date = targetDate.Date;
            
            for (int hour = workStartHour; hour < workEndHour; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30)
                {
                    var slotTime = date.AddHours(hour).AddMinutes(minute);
                    bool canStart = true;
                    
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
                        foreach (var (busyStart, busyDuration) in busyTimes)
                        {
                            var busyEndTime = busyStart.AddMinutes(busyDuration);
                            var slotEndTime = slotTime.AddMinutes(requiredDuration);
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

        public void ValidateWorkingHours(DateTime bookingTime)
        {
            var bookingHour = bookingTime.Hour;
            if (bookingHour < 8 || bookingHour >= 17)
            {
                throw new Exception($"Giờ làm việc từ 8:00 AM đến 5:00 PM. Thời gian đặt lịch hẹn ({bookingTime:HH:mm}) nằm ngoài giờ làm việc. Vui lòng chọn thời gian khác.");
            }
        }

        /// <summary>
        /// Kiểm tra xem staff có thể được phân công cho đơn hàng mới không
        /// </summary>
        public async Task<bool> CanAssignStaffToOrderAsync(int staffId, int orderDetailId, DateTime bookingTime, string serviceName)
        {
            // Kiểm tra thời gian có sẵn
            var isTimeAvailable = await IsStaffAvailableForTimeAsync(staffId, bookingTime, serviceName);
            if (!isTimeAvailable)
                return false;

            // Kiểm tra số lượng đơn hàng trong ngày
            var dailyOrderCount = await GetStaffDailyOrderCountAsync(staffId, bookingTime.Date);
            if (dailyOrderCount >= 5) // Giới hạn 5 đơn/ngày
                return false;

            return true;
        }

        /// <summary>
        /// Kiểm tra xem medical staff có thể được phân công cho đơn hàng mới không
        /// </summary>
        public async Task<bool> CanAssignMedicalStaffToOrderAsync(int medicalStaffId, int orderDetailId, DateTime bookingTime, string serviceName)
        {
            // Kiểm tra thời gian có sẵn
            var isTimeAvailable = await IsMedicalStaffAvailableForTimeAsync(medicalStaffId, bookingTime, serviceName);
            if (!isTimeAvailable)
                return false;

            // Kiểm tra số lượng đơn hàng trong ngày
            var dailyOrderCount = await GetMedicalStaffDailyOrderCountAsync(medicalStaffId, bookingTime.Date);
            if (dailyOrderCount >= 5) // Giới hạn 5 đơn/ngày
                return false;

            return true;
        }

        /// <summary>
        /// Lấy danh sách staff có sẵn với thông tin chi tiết về workload
        /// </summary>
        public async Task<List<(User Staff, int CurrentOrders, List<DateTime> AvailableSlots)>> GetAvailableStaffWithWorkloadAsync(DateTime date, string serviceName = "")
        {
            var availableStaff = new List<(User Staff, int CurrentOrders, List<DateTime> AvailableSlots)>();

            if (!string.IsNullOrEmpty(serviceName))
            {
                var medicalStaff = await GetAvailableMedicalStaffWithCriteriaAsync(serviceName, date);
                foreach (var staff in medicalStaff)
                {
                    var currentOrders = await GetMedicalStaffDailyOrderCountAsync(staff.UserId, date);
                    var busyTimes = await GetMedicalStaffBusyTimesAsync(staff.UserId, date);
                    var processingTime = GetMedicalStaffProcessingTime(serviceName);
                    var availableSlots = CalculateAvailableTimeSlots(busyTimes, processingTime, date);

                    availableStaff.Add((staff, currentOrders, availableSlots));
                }
            }
            else
            {
                var staffList = await GetAvailableStaffWithCriteriaAsync(date);
                foreach (var staff in staffList)
                {
                    var currentOrders = await GetStaffDailyOrderCountAsync(staff.UserId, date);
                    var busyTimes = await GetStaffBusyTimesAsync(staff.UserId, date);
                    var availableSlots = CalculateAvailableTimeSlots(busyTimes, 60, date); // 1 giờ mặc định

                    availableStaff.Add((staff, currentOrders, availableSlots));
                }
            }

            return availableStaff;
        }
    }
} 