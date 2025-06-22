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
        private readonly IOrderRepository _orderRepository;
        private readonly IHubContext<UserHub> _hubContext;

        public UserProfileService(
            IUserProfileRepository userProfileRepository,
            IOrderRepository orderRepository,
            IHubContext<UserHub> hubContext)
        {
            _userProfileRepository = userProfileRepository;
            _orderRepository = orderRepository;
            _hubContext = hubContext;
        }

        public async Task<UserProfileDTO> GetUserProfileByIdAsync(int userId)
        {
            var profile = await _userProfileRepository.GetByUserIdAsync(userId);
            if (profile == null)
                return null;

            return new UserProfileDTO
            {
                UserId = profile.UserId,
                Name = profile.Name,
                Email = profile.Email,
                Phone = profile.Phone,
                UpdatedAt = profile.UpdatedAt
            };
        }

        public async Task<UserProfileDTO> UpdateUserProfileAsync(int userId, UpdateUserProfile profile)
        {
            var existing = await _userProfileRepository.GetByUserIdAsync(userId);
            if (existing == null)
                return null;

            // Cập nhật thông tin
            existing.Name = profile.Name;
            existing.Phone = profile.Phone;
            existing.Email = profile.Email;
            existing.UpdatedAt = DateTime.Now;

            // Lưu thay đổi
            var updated = await _userProfileRepository.UpdateUserProfileAsync(existing);
            if (updated == null)
                return null;

            var updatedProfile = new UserProfileDTO
            {
                UserId = updated.UserId,
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

        public async Task<List<OrderHistoryDTO>> GetOrderHistoryAsync(int userId)
        {
            return await _orderRepository.GetOrderHistoryByUserIdAsync(userId);
        }

        public async Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsAsync(int orderId, int userId)
        {
            var orderDetails = await _orderRepository.GetOrderDetailsByOrderIdAsync(orderId, userId);
            foreach (var orderDetail in orderDetails)
            {
                // Kiểm tra nếu là xét nghiệm dân sự (civil)
                if (orderDetail.TestType.ToLower().Contains("civil"))
                {
                    // Không cần kiểm tra thông tin bắt buộc cho civil
                }
                else
                {
                    // Kiểm tra thông tin bắt buộc cho legal
                    if (string.IsNullOrEmpty(orderDetail.ParticipantName) || string.IsNullOrEmpty(orderDetail.NameRelation))
                    {
                        throw new Exception("Thông tin người tham gia và người thân là bắt buộc cho xét nghiệm pháp lý");
                    }
                }

                // Kiểm tra phương thức lấy mẫu
                if (!orderDetail.CollectionMethod.ToLower().Contains("at home"))
                {
                    orderDetail.DeliveryAddress = null;
                    orderDetail.DeliveryStatus = null;
                    orderDetail.DeliveryDate = null;
                    orderDetail.DeliveryNote = null;
                }
            }
            return orderDetails;
        }
    }
}
