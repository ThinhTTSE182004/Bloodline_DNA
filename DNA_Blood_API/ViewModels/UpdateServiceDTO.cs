namespace DNA_API1.ViewModels
{
    public class UpdateServiceDTO
    {
        public string ServiceName { get; set; }
        public string? Category { get; set; }
        public string? Description { get; set; }
        public int? Duration { get; set; }
        public int ProcessingTimeMinutes { get; set; }
    }
} 