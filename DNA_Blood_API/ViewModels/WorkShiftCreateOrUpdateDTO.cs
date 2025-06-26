namespace DNA_API1.ViewModels
{
    public class WorkShiftCreateOrUpdateDTO
    {
        public string ShiftName { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string? Description { get; set; }
    }
} 