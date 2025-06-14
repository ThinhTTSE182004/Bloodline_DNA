namespace DNA_API1.ViewModels
{
    public class OrderDTO
    {
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public int CollectionMethodId { get; set; }
        public string OrderStatus { get; set; }
        public DateTime? CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }

        public List<OrderDetailDTO>? Details { get; set; } 
        public PaymentDTO? Payment { get; set; }
    }
}
