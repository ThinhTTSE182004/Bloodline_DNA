using System;

namespace DNA_API1.ViewModels
{
    public class CreateFeedbackResponseDTO
    {
        public int FeedbackId { get; set; }
        public string ContentResponse { get; set; }
        public DateTime? CreateAt { get; set; }
    }
} 