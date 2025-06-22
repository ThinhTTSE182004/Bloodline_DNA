using DNA_API1.Models;
using DNA_API1.Repository;

namespace DNA_API1.Services
{
    public class StaffAssignmentService : IStaffAssignmentService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IStaffScheduleRepository _staffScheduleRepository;

        public StaffAssignmentService(IOrderRepository orderRepository, IStaffScheduleRepository staffScheduleRepository)
        {
            _orderRepository = orderRepository;
            _staffScheduleRepository = staffScheduleRepository;
        }

        public async Task<(int medicalStaffId, int staffId)> AssignStaffAsync(int servicePackageId)
        {
            // Lấy thông tin service package để biết chuyên môn cần thiết
            var servicePackage = await _orderRepository.GetServicePackageByIdAsync(servicePackageId);
            if (servicePackage == null)
            {
                throw new Exception($"Service package with ID {servicePackageId} not found");
            }

            // Tính toán thời gian làm việc thực tế dựa trên loại dịch vụ
            var medicalStaffProcessingTime = _staffScheduleRepository.CalculateMedicalStaffProcessingTime(servicePackage.ServiceName);
            var staffProcessingTime = _staffScheduleRepository.CalculateStaffProcessingTime(servicePackage.ServiceName);

            // Sử dụng StaffScheduleRepository để phân công staff dựa trên lịch trình
            var availableMedicalStaff = await _staffScheduleRepository.GetAvailableMedicalStaffWithScheduleAsync(
                servicePackage.ServiceName,
                medicalStaffProcessingTime
            );

            if (!availableMedicalStaff.Any())
            {
                throw new Exception($"Không tìm thấy nhân viên y tế nào khả dụng cho dịch vụ '{servicePackage.ServiceName}' " +
                                  $"(thời gian làm việc: {medicalStaffProcessingTime} phút). Vui lòng thử lại sau.");
            }

            // Chọn medical staff đầu tiên có thời gian rảnh
            var selectedMedicalStaff = availableMedicalStaff.First();

            // Lấy danh sách staff thông thường có thời gian rảnh
            var availableStaff = await _staffScheduleRepository.GetAvailableStaffWithScheduleAsync(staffProcessingTime);
            if (!availableStaff.Any())
            {
                throw new Exception($"Không tìm thấy nhân viên nào khả dụng cho dịch vụ '{servicePackage.ServiceName}' " +
                                  $"(thời gian lấy mẫu: {staffProcessingTime} phút). Vui lòng thử lại sau.");
            }

            // Chọn staff đầu tiên có thời gian rảnh
            var selectedStaff = availableStaff.First();

            return (selectedMedicalStaff.UserId, selectedStaff.UserId);
        }

        public async Task<List<DateTime>> GetAvailableTimeSlotsForStaffAsync(int staffId, DateTime date, int requiredDuration)
        {
            var busyTimes = await _staffScheduleRepository.GetStaffBusyTimeWithDurationAsync(staffId, date);
            return GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration);
        }

        public async Task<List<DateTime>> GetAvailableTimeSlotsForMedicalStaffAsync(int medicalStaffId, DateTime date, int requiredDuration)
        {
            var busyTimes = await _staffScheduleRepository.GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, date);
            return GetAvailableTimeSlotsWithDetailedBusyTimes(busyTimes, requiredDuration);
        }

        public async Task<bool> CheckStaffAvailabilityAsync(int staffId, DateTime startTime, int durationMinutes)
        {
            return await _staffScheduleRepository.IsStaffAvailableAtTimeAsync(staffId, startTime, durationMinutes);
        }

        public async Task<bool> CheckMedicalStaffAvailabilityAsync(int medicalStaffId, DateTime startTime, int durationMinutes)
        {
            return await _staffScheduleRepository.IsMedicalStaffAvailableAtTimeAsync(medicalStaffId, startTime, durationMinutes);
        }

        /// <summary>
        /// Tính toán thời gian làm việc thực tế của medical staff dựa trên loại dịch vụ
        /// </summary>
        private int CalculateMedicalStaffProcessingTime(string serviceName)
        {
            // Dựa trên tên dịch vụ để ước tính thời gian làm việc thực tế
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
        private int CalculateStaffProcessingTime(string serviceName)
        {
            // Staff thông thường cần ít thời gian hơn để lấy mẫu
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

        private List<DateTime> GetAvailableTimeSlots(List<DateTime> busySlots, int requiredDuration)
        {
            var availableSlots = new List<DateTime>();
            var workStartHour = 8; // Giờ làm việc bắt đầu
            var workEndHour = 17; // Giờ làm việc kết thúc
            var today = DateTime.Today;
            
            // Tạo các slot thời gian trong ngày làm việc
            for (int hour = workStartHour; hour < workEndHour; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30) // Chia thành các slot 30 phút
                {
                    var slotTime = today.AddHours(hour).AddMinutes(minute);
                    
                    // Kiểm tra xem slot này có bận không
                    bool isBusy = busySlots.Any(busySlot => 
                        Math.Abs((busySlot - slotTime).TotalMinutes) < 30);
                    
                    if (!isBusy)
                    {
                        // Kiểm tra xem có đủ thời gian liên tục không
                        bool hasEnoughTime = true;
                        for (int i = 0; i < requiredDuration; i += 30)
                        {
                            var checkTime = slotTime.AddMinutes(i);
                            if (checkTime.Hour >= workEndHour || 
                                busySlots.Any(busySlot => 
                                    Math.Abs((busySlot - checkTime).TotalMinutes) < 30))
                            {
                                hasEnoughTime = false;
                                break;
                            }
                        }
                        
                        if (hasEnoughTime)
                        {
                            availableSlots.Add(slotTime);
                        }
                    }
                }
            }
            
            return availableSlots;
        }

        private List<DateTime> GetAvailableTimeSlotsWithDetailedBusyTimes(List<(DateTime StartTime, int DurationMinutes)> busyTimes, int requiredDuration)
        {
            var availableSlots = new List<DateTime>();
            var workStartHour = 8; // Giờ làm việc bắt đầu
            var workEndHour = 17; // Giờ làm việc kết thúc
            var today = DateTime.Today;
            
            // Tạo các slot thời gian trong ngày làm việc
            for (int hour = workStartHour; hour < workEndHour; hour++)
            {
                for (int minute = 0; minute < 60; minute += 30) // Chia thành các slot 30 phút
                {
                    var slotTime = today.AddHours(hour).AddMinutes(minute);
                    
                    // Kiểm tra xem slot này có bận không
                    bool isBusy = busyTimes.Any(busyTime => 
                        slotTime >= busyTime.StartTime && slotTime < busyTime.StartTime.AddMinutes(busyTime.DurationMinutes));
                    
                    if (!isBusy)
                    {
                        // Kiểm tra xem có đủ thời gian liên tục không
                        bool hasEnoughTime = true;
                        for (int i = 0; i < requiredDuration; i += 30)
                        {
                            var checkTime = slotTime.AddMinutes(i);
                            if (checkTime.Hour >= workEndHour || 
                                busyTimes.Any(busyTime => 
                                    checkTime >= busyTime.StartTime && checkTime < busyTime.StartTime.AddMinutes(busyTime.DurationMinutes)))
                            {
                                hasEnoughTime = false;
                                break;
                            }
                        }
                        
                        if (hasEnoughTime)
                        {
                            availableSlots.Add(slotTime);
                        }
                    }
                }
            }
            
            return availableSlots;
        }
    }
} 