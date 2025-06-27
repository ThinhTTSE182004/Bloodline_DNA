using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly BloodlineDnaContext _context;

        public PaymentRepository(BloodlineDnaContext context)
        {
            _context = context;
        }
        public bool UpdatePaymentStatusByOrderId(int orderId, string status)
        {
            var payment = _context.Payments.FirstOrDefault(p => p.OrderId == orderId);
            if (payment == null) return false;
            payment.PaymentStatus = status;
            _context.SaveChanges();
            return true;
        }
    }
}
