using DNA_API1.Models;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class OrderService : IOrderService
    {
        private readonly BloodlineDnaContext _context;

        public OrderService(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task<int> CreateOrderWithPaymentAsync(CreateOrderWithPaymentDTO dto)
        {
            // Bắt đầu transaction để đảm bảo tất cả thành công hoặc rollback
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Tạo thông tin người tham gia (Participant)
                var participant = new Participant
                {
                    FullName = dto.Participant.FullName,
                    Sex = dto.Participant.Sex,
                    BirthDate = dto.Participant.BirthDate,
                    Phone = dto.Participant.Phone,
                    Relationship = dto.Participant.Relationship,
                    NameRelation = dto.Participant.NameRelation
                };

                _context.Participants.Add(participant);
                await _context.SaveChangesAsync(); // Lưu để có ParticipantId

                // 2. Tạo đơn hàng (Order)
                var order = new Order
                {
                    CustomerId = dto.CustomerId,
                    CollectionMethodId = dto.CollectionMethodId,
                    OrderStatus = dto.OrderStatus,
                    CreateAt = DateTime.Now
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                // 3. Thêm chi tiết đơn hàng (OrderDetail) và Sample
                foreach (var detailDto in dto.Details)
                {
                    // Tạo OrderDetail
                    var detail = new OrderDetail
                    {
                        OrderId = order.OrderId,
                        ServicePackageId = detailDto.ServicePackageId,
                        MedicalStaffId = detailDto.MedicalStaffId
                    };

                    _context.OrderDetails.Add(detail);
                    await _context.SaveChangesAsync(); // Lưu để có OrderDetailId

                    // Tạo Sample kết nối Participant với OrderDetail
                    var sample = new Sample
                    {
                        ParticipantId = participant.ParticipantId,
                        OrderDetailId = detail.OrderDetailId,
                        SampleTypeId = 1, // Sử dụng loại mẫu mặc định
                        StaffId = 1, // Sử dụng MedicalStaffId làm StaffId
                        SampleStatus = "Pending", // Trạng thái mặc định
                        CollectedDate = null, // Chưa có ngày lấy mẫu
                        ReceivedDate = null // Chưa có ngày nhận mẫu
                    };

                    _context.Samples.Add(sample);
                }

                // 4. Tạo thông tin thanh toán (Payment)
                var payment = new Payment
                {
                    OrderId = order.OrderId,
                    PaymentMethod = dto.Payment.PaymentMethod,
                    PaymentStatus = "Pending",
                    PaymentDate = DateTime.Now,
                    Total = (int)dto.Payment.Total
                };

                _context.Payments.Add(payment);

                // 5. Lưu toàn bộ vào database
                await _context.SaveChangesAsync();

                // 6. Commit transaction
                await transaction.CommitAsync();

                return order.OrderId;
            }
            catch (Exception)
            {
                // Nếu có lỗi, rollback tất cả
                await transaction.RollbackAsync();
                throw; // báo lỗi lên Controller
            }
        }
    }
}
