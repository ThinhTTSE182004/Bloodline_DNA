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
            return await _staffScheduleRepository.GetAvailableTimeSlotsAsync(busyTimes, requiredDuration);
        }

        public async Task<List<DateTime>> GetAvailableTimeSlotsForMedicalStaffAsync(int medicalStaffId, DateTime date, int requiredDuration)
        {
            var busyTimes = await _staffScheduleRepository.GetMedicalStaffBusyTimeWithDurationAsync(medicalStaffId, date);
            return await _staffScheduleRepository.GetAvailableTimeSlotsAsync(busyTimes, requiredDuration);
        }

        public async Task<bool> CheckStaffAvailabilityAsync(int staffId, DateTime startTime, int durationMinutes)
        {
            return await _staffScheduleRepository.IsStaffAvailableAtTimeAsync(staffId, startTime, durationMinutes);
        }

        public async Task<bool> CheckMedicalStaffAvailabilityAsync(int medicalStaffId, DateTime startTime, int durationMinutes)
        {
            return await _staffScheduleRepository.IsMedicalStaffAvailableAtTimeAsync(medicalStaffId, startTime, durationMinutes);
        }
    }
} 