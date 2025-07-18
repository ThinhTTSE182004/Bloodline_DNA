namespace DNA_Blood_API.ViewModels
{
    public class UserSimpleDTO
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public int RoleId { get; set; }
    }

    public class MedicalStaffSimpleDTO : UserSimpleDTO
    {
        public int? YearsOfExperience { get; set; }
    }
} 