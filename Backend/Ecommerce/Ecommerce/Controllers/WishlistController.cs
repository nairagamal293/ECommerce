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
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpGet]
        public async Task<ActionResult<WishlistReadDto>> GetWishlist()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var wishlist = await _wishlistService.GetWishlistByUserIdAsync(userId);
            return Ok(wishlist);
        }

        [HttpPost("items")]
        public async Task<ActionResult<WishlistItemReadDto>> AddItemToWishlist(WishlistItemAddDto wishlistItemAddDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var wishlistItem = await _wishlistService.AddItemToWishlistAsync(userId, wishlistItemAddDto);
            return CreatedAtAction(nameof(GetWishlist), wishlistItem);
        }

        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult> RemoveItemFromWishlist(int itemId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _wishlistService.RemoveItemFromWishlistAsync(userId, itemId);
            return NoContent();
        }

        [HttpDelete]
        public async Task<ActionResult> ClearWishlist()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            await _wishlistService.ClearWishlistAsync(userId);
            return NoContent();
        }
    }
}
