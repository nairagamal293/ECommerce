using Ecommerce.DTOs;

namespace Ecommerce.Services
{
    public interface IWishlistService
    {
        Task<WishlistReadDto> GetWishlistByUserIdAsync(string userId);
        Task<WishlistItemReadDto> AddItemToWishlistAsync(string userId, WishlistItemAddDto wishlistItemAddDto);
        Task<bool> RemoveItemFromWishlistAsync(string userId, int itemId);
        Task<bool> ClearWishlistAsync(string userId);
    }
}
