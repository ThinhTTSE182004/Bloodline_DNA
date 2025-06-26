using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public class PasswordResetTokenRepository : IPasswordResetTokenRepository
    {
        private readonly BloodlineDnaContext _context;
        public PasswordResetTokenRepository(BloodlineDnaContext context)
        {
            _context = context;
        }

        public async Task AddTokenAsync(PasswordResetToken token)
        {
            _context.PasswordResetTokens.Add(token);
            await _context.SaveChangesAsync();
        }

        public async Task<PasswordResetToken?> GetByTokenAsync(string token)
        {
            return await _context.PasswordResetTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task MarkAsUsedAsync(int id)
        {
            var token = await _context.PasswordResetTokens.FindAsync(id);
            if (token != null)
            {
                token.IsUsed = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteExpiredTokensAsync()
        {
            var now = DateTime.UtcNow;
            var expiredTokens = _context.PasswordResetTokens.Where(t => t.Expiry < now || t.IsUsed);
            _context.PasswordResetTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
        }
    }
} 