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

        public async Task<(int medicalStaffId, int staffId)> AssignStaffAsync(int servicePackageId, DateTime? bookingDate = null)
        {
            // Lấy thông tin service package để biết chuyên môn cần thiết
            var servicePackage = await _orderRepository.GetServicePackageByIdAsync(servicePackageId);
            if (servicePackage == null)
            {
                throw new Exception($"Service package with ID {servicePackageId} not found");
            }

            // Sử dụng booking_date nếu có, nếu không thì dùng ngày hôm nay
            var targetDate = bookingDate?.Date ?? DateTime.Today;

            // Kiểm tra giờ làm việc nếu có bookingDate
            if (bookingDate.HasValue)
            {
                var bookingHour = bookingDate.Value.Hour;
                if (bookingHour < 8 || bookingHour >= 17)
                {
                    throw new Exception($"Giờ làm việc từ 8:00 AM đến 5:00 PM. Thời gian đặt lịch hẹn ({bookingDate.Value:HH:mm}) nằm ngoài giờ làm việc. Vui lòng chọn thời gian khác.");
                }
            }

            // Tính toán thời gian làm việc thực tế dựa trên loại dịch vụ
            var medicalStaffProcessingTime = _staffScheduleRepository.CalculateMedicalStaffProcessingTime(servicePackage.ServiceName);
            var staffProcessingTime = _staffScheduleRepository.CalculateStaffProcessingTime(servicePackage.ServiceName);

            // Lấy tất cả medical staff với cân bằng tải (giới hạn 5 đơn/ngày)
            var allMedicalStaff = await _staffScheduleRepository.GetAvailableMedicalStaffWithWorkloadBalancingAsync(
                servicePackage.ServiceName,
                medicalStaffProcessingTime,
                targetDate,
                5  // Giới hạn 5 đơn/ngày
            );

            // Kiểm tra từng medical staff có thời gian rảnh cho booking time cụ thể
            User? selectedMedicalStaff = null;
            foreach (var staff in allMedicalStaff)
            {
                if (bookingDate.HasValue)
                {
                    // Kiểm tra thời gian đặt lịch cụ thể
                    var isAvailable = await _staffScheduleRepository.IsBookingTimeAvailableAsync(
                        staff.UserId, 
                        bookingDate.Value, 
                        medicalStaffProcessingTime
                    );
                    
                    if (isAvailable)
                    {
                        selectedMedicalStaff = staff;
                        break;
                    }
                }
                else
                {
                    // Nếu không có booking time cụ thể, chọn staff đầu tiên có slot rảnh
                    selectedMedicalStaff = staff;
                    break;
                }
            }

            if (selectedMedicalStaff == null)
            {
                throw new Exception($"Không tìm thấy nhân viên y tế nào khả dụng cho dịch vụ '{servicePackage.ServiceName}' " +
                                  $"(thời gian làm việc: {medicalStaffProcessingTime} phút) vào ngày {targetDate:dd/MM/yyyy} " +
                                  $"tại thời gian {bookingDate?.ToString("HH:mm") ?? "bất kỳ"}. Vui lòng thử lại sau.");
            }

            // Lấy danh sách staff thông thường với cân bằng tải
            var availableStaff = await _staffScheduleRepository.GetAvailableStaffWithWorkloadBalancingAsync(staffProcessingTime, targetDate, 5);

            if (!availableStaff.Any())
            {
                throw new Exception($"Không tìm thấy nhân viên nào khả dụng cho dịch vụ '{servicePackage.ServiceName}' " +
                                  $"(thời gian lấy mẫu: {staffProcessingTime} phút) vào ngày {targetDate:dd/MM/yyyy}. Vui lòng thử lại sau.");
            }

            // Kiểm tra từng staff có thời gian rảnh cho booking time cụ thể
            User? selectedStaff = null;
            foreach (var staff in availableStaff)
            {
                if (bookingDate.HasValue)
                {
                    // Kiểm tra thời gian đặt lịch cụ thể
                    var isAvailable = await _staffScheduleRepository.IsStaffBookingTimeAvailableAsync(
                        staff.UserId, 
                        bookingDate.Value, 
                        staffProcessingTime
                    );
                    
                    if (isAvailable)
                    {
                        selectedStaff = staff;
                        break;
                    }
                }
                else
                {
                    // Nếu không có booking time cụ thể, chọn staff đầu tiên có slot rảnh
                    selectedStaff = staff;
                    break;
                }
            }

            if (selectedStaff == null)
            {
                throw new Exception($"Không tìm thấy nhân viên nào khả dụng cho dịch vụ '{servicePackage.ServiceName}' " +
                                  $"(thời gian lấy mẫu: {staffProcessingTime} phút) vào ngày {targetDate:dd/MM/yyyy} " +
                                  $"tại thời gian {bookingDate?.ToString("HH:mm") ?? "bất kỳ"}. Vui lòng thử lại sau.");
            }

            return (selectedMedicalStaff.UserId, selectedStaff.UserId);
        }
    }
} 