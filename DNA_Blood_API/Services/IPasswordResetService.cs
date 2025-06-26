using System.Threading.Tasks;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IPasswordResetService
    {
        Task SendForgotPasswordEmailAsync(string email);
        Task ResetPasswordAsync(string token, string newPassword);
    }
} 