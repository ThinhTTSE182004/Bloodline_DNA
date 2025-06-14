using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface IUserProfileRepository : IRepository<UserProfile>
    {
        Task<UserProfile> GetByUserIdAsync(int userId);
        Task<UserProfile> UpdateUserProfileAsync(UserProfile userProfile);
    }
} 