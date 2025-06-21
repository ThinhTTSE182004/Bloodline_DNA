using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class UserProfileRepository : RepositoryBase<UserProfile>, IUserProfileRepository
    {
        public UserProfileRepository(BloodlineDnaContext context) : base(context)
        {
        }

        public async Task<UserProfile> GetByUserIdAsync(int userId)
        {
            return await _context.UserProfiles
                .Include(p => p.User)  // Include User để lấy thông tin liên quan
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<UserProfile> UpdateUserProfileAsync(UserProfile userProfile)
        {
            var existing = await _context.UserProfiles
                .Include(p => p.User)  // Include User để cập nhật
                .FirstOrDefaultAsync(p => p.UserId == userProfile.UserId);
            
            if (existing == null) return null;

            // Cập nhật UserProfile
            existing.Name = userProfile.Name;
            existing.Phone = userProfile.Phone;
            existing.Email = userProfile.Email;
            existing.UpdatedAt = DateTime.Now;

            // Cập nhật User
            if (existing.User != null)
            {
                existing.User.Name = userProfile.Name;
                existing.User.Phone = userProfile.Phone;
                existing.User.Email = userProfile.Email;
                existing.User.UpdatedAt = DateTime.Now;
            }

            _context.UserProfiles.Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }
    }
}
