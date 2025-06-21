using DNA_API1.Models;
using DNA_API1.Repository;

namespace DNA_API1.Services
{
    public class StaffAssignmentService : IStaffAssignmentService
    {
        private readonly IOrderRepository _orderRepository;
        private const int MAX_ORDERS_PER_DAY = 5; // Số đơn hàng tối đa một staff có thể xử lý trong ngày

        public StaffAssignmentService(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        public async Task<(int medicalStaffId, int staffId)> AssignStaffAsync(int servicePackageId)
        {
            // Lấy thông tin service package để biết chuyên môn cần thiết
            var servicePackage = await _orderRepository.GetServicePackageByIdAsync(servicePackageId);
            if (servicePackage == null)
            {
                throw new Exception($"Service package with ID {servicePackageId} not found");
            }

            // Lấy danh sách medical staff phù hợp
            var availableMedicalStaff = await _orderRepository.GetAvailableMedicalStaffAsync(
                servicePackage.ServiceName,  // Sử dụng ServiceName thay vì Specialization
                MAX_ORDERS_PER_DAY
            );

            if (!availableMedicalStaff.Any())
            {
                // Nếu không tìm thấy medical staff phù hợp, tìm bất kỳ medical staff nào có kinh nghiệm
                availableMedicalStaff = await _orderRepository.GetAvailableMedicalStaffAsync(
                    "",  // Bỏ qua điều kiện specialization
                    MAX_ORDERS_PER_DAY
                );

                if (!availableMedicalStaff.Any())
                {
                    throw new Exception("Không tìm thấy nhân viên y tế nào khả dụng. Vui lòng thử lại sau.");
                }
            }

            // Chọn medical staff có ít đơn hàng nhất
            var selectedMedicalStaff = availableMedicalStaff.First();

            // Lấy danh sách staff thông thường
            var availableStaff = await _orderRepository.GetAvailableStaffAsync(MAX_ORDERS_PER_DAY);
            if (!availableStaff.Any())
            {
                throw new Exception("Không tìm thấy nhân viên nào khả dụng. Vui lòng thử lại sau.");
            }

            // Chọn staff có ít đơn hàng nhất
            var selectedStaff = availableStaff.First();

            return (selectedMedicalStaff.UserId, selectedStaff.UserId);
        }
    }
} 