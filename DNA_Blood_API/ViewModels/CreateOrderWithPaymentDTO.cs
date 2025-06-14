namespace DNA_API1.ViewModels
{
    public class CreateOrderWithPaymentDTO
    {
        public int CustomerId { get; set; }
        public int CollectionMethodId { get; set; }
        public string OrderStatus { get; set; }

        public List<OrderDetailDTO> Details { get; set; }
        public CreatePaymentDTO Payment { get; set; }
        public ParticipantDTO Participant { get; set; }
    }

    public class CreatePaymentDTO
    {
        public string PaymentMethod { get; set; }
        public decimal Total { get; set; }
    }
}
