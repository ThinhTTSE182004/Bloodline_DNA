namespace DNA_API1.ViewModels
{
    public class PaymentDTO
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public string PaymentMethod { get; set; }   
        public string PaymentStatus { get; set; }   
        public DateTime PaymentDate { get; set; }
        public decimal Total { get; set; }
    }
}
