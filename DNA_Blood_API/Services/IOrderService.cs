using DNA_API1.ViewModels;
using DNA_API1.Models;

namespace DNA_API1.Services
{
    public interface IOrderService
    {
        Task<int> CreateOrderWithPaymentAsync(CreateOrderWithPaymentDTO dto);
        Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsAsync(int orderId, int userId);

        Task<OrderHistoryDTO?> ConfirmOrderAsync(int orderId);

        Task<List<OrderHistoryDTO>> GetAllOrdersForStaffAsync();

        Task<bool> OrderExistsForUserAsync(int orderId, int userId);

        Task<Order?> GetOrderByIdAndUserIdAsync(int orderId, int userId);
    }
}
