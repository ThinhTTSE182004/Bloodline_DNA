namespace DNA_API1.Repository
{
    public interface IPaymentRepository
    {
        bool UpdatePaymentStatusByOrderId(int orderId, string status);
    }
}
