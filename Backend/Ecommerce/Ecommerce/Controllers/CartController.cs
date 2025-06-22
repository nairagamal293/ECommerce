using Ecommerce.DTOs;
using Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet]
        public async Task<ActionResult<CartReadDto>> GetCart()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var cart = await _cartService.GetCartByUserIdAsync(userId);
            return Ok(cart);
        }
        [Authorize]
        [HttpPost("items")]
        public async Task<ActionResult<CartItemReadDto>> AddItemToCart(CartItemAddDto cartItemAddDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var cartItem = await _cartService.AddItemToCartAsync(userId, cartItemAddDto);
            return CreatedAtAction(nameof(GetCart), cartItem);
        }

        [HttpPut("items/{itemId}")]
        public async Task<ActionResult<CartItemReadDto>> UpdateCartItem(int itemId, CartItemUpdateDto cartItemUpdateDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var cartItem = await _cartService.UpdateCartItemAsync(userId, itemId, cartItemUpdateDto);
            return Ok(cartItem);
        }

        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult> RemoveItemFromCart(int itemId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _cartService.RemoveItemFromCartAsync(userId, itemId);
            return NoContent();
        }

        [HttpDelete]
        public async Task<ActionResult> ClearCart()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _cartService.ClearCartAsync(userId);
            return NoContent();
        }
    }
}
