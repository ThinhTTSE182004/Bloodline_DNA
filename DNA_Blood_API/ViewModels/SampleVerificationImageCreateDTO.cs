using System;

namespace DNA_API1.ViewModels
{
    public class SampleVerificationImageCreateDTO
    {
        public int SampleId { get; set; }
        public string ImageUrl { get; set; }
        public string VerificationType { get; set; }
        public string Note { get; set; }
    }
} 