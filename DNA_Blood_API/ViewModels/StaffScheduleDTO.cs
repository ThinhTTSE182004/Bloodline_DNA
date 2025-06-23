namespace DNA_API1.ViewModels
{
    public class StaffScheduleDTO
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public string Role { get; set; }
        public DateTime Date { get; set; }
        public List<TimeSlotDTO> AvailableSlots { get; set; } = new List<TimeSlotDTO>();
        public List<TimeSlotDTO> BusySlots { get; set; } = new List<TimeSlotDTO>();
        public int TotalAvailableMinutes { get; set; }
        public int TotalBusyMinutes { get; set; }
    }

    public class TimeSlotDTO
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int DurationMinutes { get; set; }
        public string Status { get; set; } // "Available", "Busy", "Break"
        public string? OrderId { get; set; }
        public string? ServiceName { get; set; }
    }

    public class StaffAvailabilityRequest
    {
        public int StaffId { get; set; }
        public DateTime Date { get; set; }
        public int RequiredDurationMinutes { get; set; }
        public string? ServiceName { get; set; }
    }

    public class StaffAvailabilityResponse
    {
        public int StaffId { get; set; }
        public string StaffName { get; set; }
        public DateTime Date { get; set; }
        public int RequiredDurationMinutes { get; set; }
        public bool IsAvailable { get; set; }
        public List<TimeSlotDTO> AvailableSlots { get; set; } = new List<TimeSlotDTO>();
        public string? Message { get; set; }
    }
} 