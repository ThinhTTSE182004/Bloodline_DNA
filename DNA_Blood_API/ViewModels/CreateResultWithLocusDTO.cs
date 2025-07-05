namespace DNA_API1.ViewModels
{
    public class CreateResultWithLocusDTO
    {
        public int OrderDetailId { get; set; }
        public DateTime? ReportDate { get; set; }
        public string? TestSummary { get; set; }
        public string? RawDataPath { get; set; }
        public string? ReportUrl { get; set; }
        public string ResultStatus { get; set; }
        public List<CreateLocusResultDTO> LocusResults { get; set; } = new List<CreateLocusResultDTO>();
    }

    public class CreateLocusResultDTO
    {
        public int LocusId { get; set; }
        public string PersonAAlleles { get; set; }
        public string PersonBAlleles { get; set; }
        public bool? IsMatch { get; set; }
    }
} 