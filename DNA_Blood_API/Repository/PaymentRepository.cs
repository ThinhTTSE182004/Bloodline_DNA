using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

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

    public Payment GetByOrderId(int orderId)
    {
        // Include Order để lấy được CustomerId
        return _context.Payments
            .Include(p => p.Order)
            .FirstOrDefault(p => p.OrderId == orderId);
    }

    public void Update(Payment payment)
    {
        _context.Payments.Update(payment);
        _context.SaveChanges();
    }
}