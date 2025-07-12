namespace DNA_API1.ViewModels
{
    public class ResultDetailDTO
    {
        public int ResultId { get; set; }
        public int OrderDetailId { get; set; }
        public string TestName { get; set; }           // Tên dịch vụ/gói xét nghiệm
        public DateTime? ReportDate { get; set; }
        public string? TestSummary { get; set; }
        public string ResultStatus { get; set; }
        public DateTime? CreateAt { get; set; }
        public List<SampleInfoDTO> Samples { get; set; }   // Danh sách mẫu liên quan
    }

    public class SampleInfoDTO
    {
        public int SampleId { get; set; }
        public string? SampleStatus { get; set; }
        public string? SampleName { get; set; } // Lấy từ SampleType.Name
        public ParticipantInfoDTO? Participant { get; set; } // Thông tin participant
    }

    public class ParticipantInfoDTO
    {
        public int? ParticipantId { get; set; }
        public string? FullName { get; set; }
        public string? Sex { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string? Relationship { get; set; }
        public string? Phone { get; set; }
    }
} 