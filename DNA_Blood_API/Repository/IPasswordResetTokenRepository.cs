using DNA_API1.Models;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public interface IPasswordResetTokenRepository
    {
        Task AddTokenAsync(PasswordResetToken token);
        Task<PasswordResetToken?> GetByTokenAsync(string token);
        Task MarkAsUsedAsync(int id);
        Task DeleteExpiredTokensAsync();
    }
} 