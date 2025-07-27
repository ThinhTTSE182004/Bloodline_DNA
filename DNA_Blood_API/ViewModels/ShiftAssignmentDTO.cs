namespace DNA_Blood_API.ViewModels
{
    public class ShiftAssignmentDTO
    {
        public int AssignmentId { get; set; }
        public int UserId { get; set; }
        public int ShiftId { get; set; }
        public System.DateOnly AssignmentDate { get; set; }
        // Có thể thêm các trường khác nếu cần, KHÔNG có navigation property
    }
} 