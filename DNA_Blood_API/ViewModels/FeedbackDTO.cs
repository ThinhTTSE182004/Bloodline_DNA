using System;
using System.Collections.Generic;

namespace DNA_API1.ViewModels
{
    public class FeedbackDTO
    {
        public int FeedbackId { get; set; }
        public int OrderId { get; set; }
        public string Name { get; set; }
        public decimal Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime? CreateAt { get; set; }
        public List<string> ContentResponses { get; set; }
    }
} 