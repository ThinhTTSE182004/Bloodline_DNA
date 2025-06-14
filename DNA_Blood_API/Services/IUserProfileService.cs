using DNA_API1.Repository;
using DNA_API1.ViewModels;
using DNA_API1.Models;

namespace DNA_API1.Services
{
    public interface IUserProfileService
    {
        Task<UserProfileDTO> GetUserProfileByIdAsync(int userId);
        Task<UserProfileDTO> UpdateUserProfileAsync(int userId, UpdateUserProfile profile);
        Task<List<OrderHistoryDTO>> GetOrderHistoryAsync(int userId);
        Task<OrderDetailHistoryDTO?> GetOrderDetailAsync(int orderId, int userId);
    }
}
