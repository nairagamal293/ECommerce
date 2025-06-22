using AutoMapper;
using Ecommerce.Data;
using Ecommerce.DTOs;
using Ecommerce.Models;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public CartService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<CartReadDto> GetCartByUserIdAsync(string userId)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                throw new KeyNotFoundException("Cart not found");
            }

            var cartDto = _mapper.Map<CartReadDto>(cart);
            cartDto.TotalAmount = cart.CartItems.Sum(ci =>
                ci.Product.DiscountedPrice.HasValue ?
                ci.Product.DiscountedPrice.Value * ci.Quantity :
                ci.Product.Price * ci.Quantity);

            return cartDto;
        }

        public async Task<CartItemReadDto> AddItemToCartAsync(string userId, CartItemAddDto cartItemAddDto)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                throw new KeyNotFoundException("Cart not found");
            }

            var product = await _context.Products.FindAsync(cartItemAddDto.ProductId);
            if (product == null)
            {
                throw new KeyNotFoundException("Product not found");
            }

            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == cartItemAddDto.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += cartItemAddDto.Quantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    ProductId = cartItemAddDto.ProductId,
                    Quantity = cartItemAddDto.Quantity,
                    ShoppingCartId = cart.Id
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            var cartItemDto = existingItem != null ?
                _mapper.Map<CartItemReadDto>(existingItem) :
                _mapper.Map<CartItemReadDto>(cart.CartItems.First(ci => ci.ProductId == cartItemAddDto.ProductId));

            cartItemDto.ProductName = product.Name;
            cartItemDto.ProductImageUrl = product.ImageUrl;
            cartItemDto.Price = product.Price;
            cartItemDto.DiscountedPrice = product.DiscountedPrice;
            cartItemDto.TotalPrice = product.DiscountedPrice.HasValue ?
                product.DiscountedPrice.Value * cartItemDto.Quantity :
                product.Price * cartItemDto.Quantity;

            return cartItemDto;
        }

        public async Task<CartItemReadDto> UpdateCartItemAsync(string userId, int itemId, CartItemUpdateDto cartItemUpdateDto)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                throw new KeyNotFoundException("Cart not found");
            }

            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == itemId);
            if (cartItem == null)
            {
                throw new KeyNotFoundException("Cart item not found");
            }

            cartItem.Quantity = cartItemUpdateDto.Quantity;
            await _context.SaveChangesAsync();

            var cartItemDto = _mapper.Map<CartItemReadDto>(cartItem);
            cartItemDto.ProductName = cartItem.Product.Name;
            cartItemDto.ProductImageUrl = cartItem.Product.ImageUrl;
            cartItemDto.Price = cartItem.Product.Price;
            cartItemDto.DiscountedPrice = cartItem.Product.DiscountedPrice;
            cartItemDto.TotalPrice = cartItem.Product.DiscountedPrice.HasValue ?
                cartItem.Product.DiscountedPrice.Value * cartItemDto.Quantity :
                cartItem.Product.Price * cartItemDto.Quantity;

            return cartItemDto;
        }

        public async Task<bool> RemoveItemFromCartAsync(string userId, int itemId)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                throw new KeyNotFoundException("Cart not found");
            }

            var cartItem = cart.CartItems.FirstOrDefault(ci => ci.Id == itemId);
            if (cartItem == null)
            {
                throw new KeyNotFoundException("Cart item not found");
            }

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ClearCartAsync(string userId)
        {
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null)
            {
                throw new KeyNotFoundException("Cart not found");
            }

            _context.CartItems.RemoveRange(cart.CartItems);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
