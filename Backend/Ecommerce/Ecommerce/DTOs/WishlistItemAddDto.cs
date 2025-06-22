using System.ComponentModel.DataAnnotations;

namespace Ecommerce.DTOs
{
    public class WishlistItemAddDto
    {
        [Required]
        public int ProductId { get; set; }
    }

    public class WishlistItemReadDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountedPrice { get; set; }
    }

    public class WishlistReadDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public List<WishlistItemReadDto> WishlistItems { get; set; }
    }
}
