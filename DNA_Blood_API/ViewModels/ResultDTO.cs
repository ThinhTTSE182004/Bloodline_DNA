namespace DNA_API1.ViewModels
{
    public class ResultDTO
    {
        public int ResultId { get; set; }
        public int OrderDetailId { get; set; }
        public DateTime? ReportDate { get; set; }
        public string? TestSummary { get; set; }
        public string? RawDataPath { get; set; }
        public string? ReportUrl { get; set; }
        public string ResultStatus { get; set; }
        public DateTime? CreateAt { get; set; }
        public DateTime? UpdateAt { get; set; }
    }
}
