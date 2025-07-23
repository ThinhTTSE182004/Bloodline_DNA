using System;


namespace DNA_Blood_API.ViewModels
{
    public class WorkShiftAssignmentDTO
    {
        public int AssignmentId { get; set; }
        public DateOnly AssignmentDate { get; set; }
        public int ShiftId { get; set; }
        public string ShiftName { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public string Description { get; set; }
    }
} 