using DNA_API1.Hubs;
using DNA_API1.Models;
using DNA_API1.Repository;
using Microsoft.AspNetCore.SignalR;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IHubContext<UserHub> _hubContext;

        public PaymentService(IPaymentRepository paymentRepository, IHubContext<UserHub> hubContext)
        {
            _paymentRepository = paymentRepository;
            _hubContext = hubContext;
        }

        public async Task<bool> UpdatePaymentStatusByOrderId(int orderId, string status)
        {
            var payment = _paymentRepository.GetByOrderId(orderId);
            if (payment == null)
                return false;

            var oldStatus = payment.PaymentStatus;
            payment.PaymentStatus = status;
            _paymentRepository.Update(payment);

            // Gửi noti nếu status chuyển từ khác sang "Paid"
            if ((oldStatus != "Paid" && status == "Paid") || (oldStatus != "Success" && status == "Success") || (oldStatus != "Đã thanh toán" && status == "Đã thanh toán"))
            {
                var customerId = payment.Order.CustomerId;
                var payload = new
                {
                    message = "Thanh toán thành công!",
                    orderId = payment.OrderId,
                    amount = payment.Total,
                    paymentDate = payment.PaymentDate,
                    status = payment.PaymentStatus
                };
                Console.WriteLine("[SignalR] Payload gửi PaymentSuccess: " + JsonConvert.SerializeObject(payload)+customerId);
                await _hubContext.Clients.Group($"User_{customerId}").SendAsync("PaymentSuccess", payload);
            }

            return true;
        }
    }
}
