namespace DNA_API1.ViewModels
{
    public class OrderHistoryDTO
    {
        public int OrderId { get; set; }
        public string ServiceName { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } = null!;
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = null!;

        public string? PaymentStatus { get; set; }
        public string SampleCollectionMethod { get; set; } = null!;

    }
} 