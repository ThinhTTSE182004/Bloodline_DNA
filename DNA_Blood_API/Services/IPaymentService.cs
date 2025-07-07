namespace DNA_API1.Services
{
    public interface IPaymentService
    {
        Task<bool> UpdatePaymentStatusByOrderId(int orderId, string status);
    }
}
