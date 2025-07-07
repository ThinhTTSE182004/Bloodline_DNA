using DNA_API1.Models;

public interface IPaymentRepository
{
    bool UpdatePaymentStatusByOrderId(int orderId, string status);
    Payment GetByOrderId(int orderId); // Thêm hàm này
    void Update(Payment payment);      // Thêm hàm này
}