using System;

namespace DNA_API1.ViewModels
{
    public class CreateFeedbackDTO
    {
        public int OrderId { get; set; }
        public string Name { get; set; }
        public decimal Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreateAt { get; set; }
    }
} 