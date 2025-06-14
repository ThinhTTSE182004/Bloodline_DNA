using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using DNA_API1.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    // UserProfileService.cs
    public class UserProfileService : IUserProfileService
    {
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IHubContext<UserHub> _hubContext;

        public UserProfileService(
            IUserProfileRepository userProfileRepository,
            IHubContext<UserHub> hubContext)
        {
            _userProfileRepository = userProfileRepository;
            _hubContext = hubContext;
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

            var updatedProfile = new UpdateUserProfile
            {
                Name = updated.Name,
                Email = updated.Email,
                Phone = updated.Phone,
                UpdatedAt = updated.UpdatedAt
            };

            // Gửi thông báo cập nhật qua SignalR
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("UserProfileUpdated", updatedProfile);

            return updatedProfile;
        }
    }
}
