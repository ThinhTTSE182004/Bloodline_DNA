namespace DNA_Blood_API.ViewModels
{
    public class ShiftAssignmentSuggestionDTO
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public int ShiftId { get; set; }
        public string ShiftName { get; set; }
        public System.DateOnly AssignmentDate { get; set; }
        public int AssignedCountInMonth { get; set; }
        public bool IsSuggested { get; set; } // true: gợi ý, false: không gợi ý
    }
} 