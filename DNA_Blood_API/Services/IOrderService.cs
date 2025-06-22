using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface IOrderService
    {
        Task<int> CreateOrderWithPaymentAsync(CreateOrderWithPaymentDTO dto);
        Task<IEnumerable<OrderDetailHistoryDTO>> GetOrderDetailsAsync(int orderId, int userId);

        Task<OrderHistoryDTO?> ConfirmOrderAsync(int orderId);

        Task<List<OrderHistoryDTO>> GetAllOrdersForStaffAsync();

       
    }
}
