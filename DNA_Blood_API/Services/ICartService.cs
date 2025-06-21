using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface ICartService
    {
        Task<CartItemDTO> AddToCartAsync(string userId, AddToCartDTO cart);
        Task<IEnumerable<CartItemDTO>> GetCartItemsAsync(string userId);
        Task<bool> RemoveFromCartAsync(string userId, int servicePackageId);
    }
} 