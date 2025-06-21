using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class CartService : ICartService
    {
        private readonly IServicePackageRepository _servicePackageRepository;
        private static readonly Dictionary<string, List<CartItemDTO>> _cartStore = new();

        public CartService(IServicePackageRepository servicePackageRepository)
        {
            _servicePackageRepository = servicePackageRepository;
        }

        public async Task<CartItemDTO> AddToCartAsync(string userId, AddToCartDTO cart)
        {
            var service = await _servicePackageRepository.GetByIdAsync(cart.ServicePackageId);
            if (service == null)
                return null;

            if (!_cartStore.ContainsKey(userId))
            {
                _cartStore[userId] = new List<CartItemDTO>();
            }

            var existingItem = _cartStore[userId].FirstOrDefault(c => c.ServicePackageId == cart.ServicePackageId);
            if (existingItem != null)
            {
                return existingItem;
            }

            var cartItem = new CartItemDTO
            {
                ServicePackageId = service.ServicePackageId,
                ServiceName = service.ServiceName,
                Category = service.Category,
                Price = service.ServicePrices?.FirstOrDefault()?.Price ?? 0
            };

            _cartStore[userId].Add(cartItem);
            return cartItem;
        }

        public async Task<IEnumerable<CartItemDTO>> GetCartItemsAsync(string userId)
        {
            if (!_cartStore.ContainsKey(userId))
                return Enumerable.Empty<CartItemDTO>();

            return _cartStore[userId];
        }

        public Task<bool> RemoveFromCartAsync(string userId, int servicePackageId)
        {
            if (!_cartStore.ContainsKey(userId))
                return Task.FromResult(false);

            var item = _cartStore[userId].FirstOrDefault(c => c.ServicePackageId == servicePackageId);
            if (item == null)
                return Task.FromResult(false);

            _cartStore[userId].Remove(item);
            return Task.FromResult(true);
        }
    }
} 