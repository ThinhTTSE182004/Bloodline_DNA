using DNA_API1.Repository;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IUserProfileService
    {
        Task<UpdateUserProfile> GetUserProfileAsync(int userId);
        Task<UpdateUserProfile> UpdateUserProfileAsync(int userId, UpdateUserProfile profile);
    }
}
