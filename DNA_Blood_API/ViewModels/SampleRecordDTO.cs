using System.Collections.Generic;

namespace DNA_API1.ViewModels
{
    public class SampleRecordDTO
    {
        public int SampleId { get; set; }
        public string SampleTypeName { get; set; } = string.Empty;
        public List<string> KitCodes { get; set; } = new List<string>();
        public string SampleStatus { get; set; } = string.Empty;
    }
} 