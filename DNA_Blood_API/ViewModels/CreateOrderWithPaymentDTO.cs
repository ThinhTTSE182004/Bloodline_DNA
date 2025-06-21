namespace DNA_API1.ViewModels
{
    public class CreateOrderWithPaymentDTO
    {
        public int CustomerId { get; set; }
        // Thông tin người tham gia xét nghiệm
        public CreateParticipantDTO Participant { get; set; }
        
        // Thông tin gói dịch vụ
        public List<CreateOrderDetailDTO> Details { get; set; }
        
        // Thông tin thanh toán
        public CreatePaymentDTO Payment { get; set; }
        
        // Thông tin loại xét nghiệm, mẫu, phương thức
        public string TestTypeName { get; set; }
        public string SampleTypeName { get; set; }
        public string MethodTypeName { get; set; }
    }
}
