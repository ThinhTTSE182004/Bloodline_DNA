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
            return await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task<UserProfile> UpdateUserProfileAsync(UserProfile userProfile)
        {
            var existing = await _context.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userProfile.UserId);
            if (existing == null) return null;

            existing.Name = userProfile.Name;
            existing.Phone = userProfile.Phone;
            existing.Email = userProfile.Email;
            existing.UpdatedAt = DateTime.Now;

            _context.UserProfiles.Update(existing);
            await _context.SaveChangesAsync();

            return existing;
        }
    }
}
