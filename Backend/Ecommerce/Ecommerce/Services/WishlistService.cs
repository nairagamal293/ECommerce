using AutoMapper;
using Ecommerce.Data;
using Ecommerce.DTOs;
using Ecommerce.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public WishlistService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<WishlistReadDto> GetWishlistByUserIdAsync(string userId)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.WishlistItems)
                .ThenInclude(wi => wi.Product)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                throw new KeyNotFoundException("Wishlist not found");
            }

            return _mapper.Map<WishlistReadDto>(wishlist);
        }

        public async Task<WishlistItemReadDto> AddItemToWishlistAsync(string userId, WishlistItemAddDto wishlistItemAddDto)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.WishlistItems)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                throw new KeyNotFoundException("Wishlist not found");
            }

            var product = await _context.Products.FindAsync(wishlistItemAddDto.ProductId);
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found");
            }

            var existingItem = wishlist.WishlistItems.FirstOrDefault(wi => wi.ProductId == wishlistItemAddDto.ProductId);
            if (existingItem != null)
            {
                throw new ApplicationException("Product already in wishlist");
            }

            var wishlistItem = new WishlistItem
            {
                ProductId = wishlistItemAddDto.ProductId,
                WishlistId = wishlist.Id
            };

            _context.WishlistItems.Add(wishlistItem);
            await _context.SaveChangesAsync();

            var wishlistItemDto = _mapper.Map<WishlistItemReadDto>(wishlistItem);
            wishlistItemDto.ProductName = product.Name;
            wishlistItemDto.ProductImageUrl = product.ImageUrl;
            wishlistItemDto.Price = product.Price;
            wishlistItemDto.DiscountedPrice = product.DiscountedPrice;

            return wishlistItemDto;
        }

        public async Task<bool> RemoveItemFromWishlistAsync(string userId, int itemId)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.WishlistItems)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                throw new KeyNotFoundException("Wishlist not found");
            }

            var wishlistItem = wishlist.WishlistItems.FirstOrDefault(wi => wi.Id == itemId);
            if (wishlistItem == null)
            {
                throw new KeyNotFoundException("Wishlist item not found");
            }

            _context.WishlistItems.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ClearWishlistAsync(string userId)
        {
            var wishlist = await _context.Wishlists
                .Include(w => w.WishlistItems)
                .FirstOrDefaultAsync(w => w.UserId == userId);

            if (wishlist == null)
            {
                throw new KeyNotFoundException("Wishlist not found");
            }

            _context.WishlistItems.RemoveRange(wishlist.WishlistItems);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
