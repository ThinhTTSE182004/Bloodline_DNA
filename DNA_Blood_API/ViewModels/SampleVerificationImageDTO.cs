namespace DNA_API1.ViewModels
{
    public class SampleVerificationImageDTO
    {
        public int VerificationImageId { get; set; }
        public int SampleId { get; set; }
        public string ImageUrl { get; set; }
        public DateTime CaptureTime { get; set; }
        public int CapturedBy { get; set; }
        public string CapturedByName { get; set; }
        public string VerificationType { get; set; }
        public int? VerifiedBy { get; set; }
        public string VerifiedByName { get; set; }
        public string VerificationStatus { get; set; }
        public string Note { get; set; }
        public int? ParticipantId { get; set; }
        public string ParticipantName { get; set; }
    }
}
