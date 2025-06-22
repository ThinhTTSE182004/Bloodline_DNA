using DNA_API1.Models;
using DNA_API1.ViewModels;


namespace LoginAPI.Services
{
    public interface IAuthService
    {
        Task<UserProfileDTO> RegisterAsync(RegisterDTO request);
        Task<UserProfileDTO> RegisterStaffAsync(RegisterDTO request);

        Task<UserProfileDTO> RegisterMedicalStaffAsync(RegisterMedicalStaff request);

        Task<string> LoginAsync(LoginDTO request);

        Task<string> HandleGoogleLoginAsync(string email, string name);
    }
}
