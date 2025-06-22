using Ecommerce.DTOs;

namespace Ecommerce.Services
{
    public interface ICartService
    {
        Task<CartReadDto> GetCartByUserIdAsync(string userId);
        Task<CartItemReadDto> AddItemToCartAsync(string userId, CartItemAddDto cartItemAddDto);
        Task<CartItemReadDto> UpdateCartItemAsync(string userId, int itemId, CartItemUpdateDto cartItemUpdateDto);
        Task<bool> RemoveItemFromCartAsync(string userId, int itemId);
        Task<bool> ClearCartAsync(string userId);
    }
}
