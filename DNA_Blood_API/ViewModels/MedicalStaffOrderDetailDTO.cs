namespace DNA_API1.ViewModels
{
    public class MedicalStaffOrderDetailDTO
    {
        public int OrderDetailId { get; set; }
        public string CustomerName { get; set; }
        public string ServiceName { get; set; }
        public string Status { get; set; }
        public DateTime? OrderDate { get; set; }
    }
}
