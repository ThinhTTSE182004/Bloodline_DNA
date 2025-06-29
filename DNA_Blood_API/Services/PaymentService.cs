using DNA_API1.Repository;

namespace DNA_API1.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;

        public PaymentService(IPaymentRepository paymentRepository)
        {
            _paymentRepository = paymentRepository;
        }
        public bool UpdatePaymentStatusByOrderId(int orderId, string status)
        {
            return _paymentRepository.UpdatePaymentStatusByOrderId(orderId, status);
        }
    }
}
