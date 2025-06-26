namespace DNA_API1.ViewModels
{
    public class ServiceAddResultDTO
    {
        public int ServicePackageId { get; set; }
        public string ServiceName { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public int? Duration { get; set; }
        public int ProcessingTimeMinutes { get; set; }
        public decimal Price { get; set; }
    }
} 