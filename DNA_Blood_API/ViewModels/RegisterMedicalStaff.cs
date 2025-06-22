namespace DNA_API1.ViewModels
{
    public class RegisterMedicalStaff
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; }
        public int YOE { get; set; }

        public string Specialization { get; set; }
    }
}
