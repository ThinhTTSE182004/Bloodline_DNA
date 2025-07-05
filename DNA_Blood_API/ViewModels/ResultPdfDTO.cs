namespace DNA_API1.ViewModels
{
    public class ResultPdfDTO
    {
        public int ResultId { get; set; }
        public DateTime? ReportDate { get; set; }
        public string TestSummary { get; set; }
        public string ResultStatus { get; set; }
        public DateTime? CreateAt { get; set; }
        public string ServiceName { get; set; }
        public int OrderId { get; set; }
        public DateTime? OrderDate { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public List<ParticipantPdfDTO> Participants { get; set; } = new List<ParticipantPdfDTO>();
        public List<LocusResultPdfDTO> LocusResults { get; set; } = new List<LocusResultPdfDTO>();
    }

    public class ParticipantPdfDTO
    {
        public string FullName { get; set; }
        public string Sex { get; set; }
        public DateOnly? BirthDate { get; set; }
        public string Relationship { get; set; }
        public string SampleType { get; set; }
        public DateOnly? CollectedDate { get; set; }
    }

    public class LocusResultPdfDTO
    {
        public string LocusName { get; set; }
        public string PersonAAlleles { get; set; }
        public string PersonBAlleles { get; set; }
        public bool? IsMatch { get; set; }
        public string MatchStatus => IsMatch == true ? "MATCH" : IsMatch == false ? "NO MATCH" : "N/A";
    }
} 