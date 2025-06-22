using System.ComponentModel.DataAnnotations;

namespace Ecommerce.DTOs
{
    public class CartItemAddDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class CartItemUpdateDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }

    public class CartItemReadDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductImageUrl { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CartReadDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public List<CartItemReadDto> CartItems { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
