namespace DNA_API1.Services
{
    public interface IPaymentService
    {
        bool UpdatePaymentStatusByOrderId(int orderId, string status);
    }
}
