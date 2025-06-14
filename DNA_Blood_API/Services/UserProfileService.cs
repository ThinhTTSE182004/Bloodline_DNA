using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    // UserProfileService.cs
    public class UserProfileService : IUserProfileService
    {
        private readonly IUserProfileRepository _userProfileRepository;

        public UserProfileService(IUserProfileRepository userProfileRepository)
        {
            _userProfileRepository = userProfileRepository;
        }

        public async Task<UpdateUserProfile> GetUserProfileAsync(int userId)
        {
            var profile = await _userProfileRepository.GetByUserIdAsync(userId);
            if (profile == null)
                return null;

            return new UpdateUserProfile
            {
                Name = profile.Name,
                Email = profile.Email,
                Phone = profile.Phone,
                UpdatedAt = profile.UpdatedAt
            };
        }

        public async Task<UpdateUserProfile> UpdateUserProfileAsync(int userId, UpdateUserProfile dto)
        {
            var existing = await _userProfileRepository.GetByUserIdAsync(userId);
            if (existing == null)
                return null;

            // Cập nhật thông tin
            existing.Name = dto.Name;
            existing.Phone = dto.Phone;
            existing.Email = dto.Email;
            existing.UpdatedAt = DateTime.Now;

            // Lưu thay đổi
            var updated = await _userProfileRepository.UpdateUserProfileAsync(existing);
            if (updated == null)
                return null;

            // Trả về thông tin đã cập nhật
            return new UpdateUserProfile
            {
                Name = updated.Name,
                Email = updated.Email,
                Phone = updated.Phone,
                UpdatedAt = updated.UpdatedAt
            };
        }
    }
}
