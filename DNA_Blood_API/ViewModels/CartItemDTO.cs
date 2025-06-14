namespace DNA_API1.ViewModels
{
    public class CartItemDTO
    {
        public int ServicePackageId { get; set; }
        public string ServiceName { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public decimal Price { get; set; }
        public DateTime AddedAt { get; set; }
    }
} 