namespace DNA_API1.ViewModels
{
    public class SampleTransferDTO
    {
        public int SampleTransferId { get; set; }
        public int SampleId { get; set; }
        public string SampleTypeName { get; set; } = string.Empty;
        public string KitCode { get; set; } = string.Empty;
        public string SampleTransferStatus { get; set; } = string.Empty;
        public string StaffName { get; set; } = string.Empty;
        public string MedicalStaffName { get; set; } = string.Empty;
        public DateTime? TransferDate { get; set; }
        public string CollectionMethod { get; set; } = string.Empty;
    }
}