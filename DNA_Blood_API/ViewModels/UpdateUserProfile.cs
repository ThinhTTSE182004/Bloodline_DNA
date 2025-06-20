namespace DNA_API1.ViewModels
{
    public class UpdateUserProfile
    {
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
