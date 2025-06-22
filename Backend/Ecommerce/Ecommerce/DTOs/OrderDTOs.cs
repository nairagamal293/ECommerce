using System.ComponentModel.DataAnnotations;

namespace Ecommerce.DTOs
{
    public class OrderCreateDto
    {
        [Required]
        public string PaymentMethod { get; set; }

        [Required]
        public ShippingAddressDto ShippingAddress { get; set; }

        [Required]
        public BillingAddressDto BillingAddress { get; set; }
    }

    public class ShippingAddressDto
    {
        [Required]
        [MaxLength(100)]
        public string Street { get; set; }

        [Required]
        [MaxLength(50)]
        public string City { get; set; }

        [Required]
        [MaxLength(50)]
        public string State { get; set; }

        [Required]
        [MaxLength(20)]
        public string ZipCode { get; set; }

        [Required]
        [MaxLength(50)]
        public string Country { get; set; }
    }

    public class BillingAddressDto
    {
        [Required]
        [MaxLength(100)]
        public string Street { get; set; }

        [Required]
        [MaxLength(50)]
        public string City { get; set; }

        [Required]
        [MaxLength(50)]
        public string State { get; set; }

        [Required]
        [MaxLength(20)]
        public string ZipCode { get; set; }

        [Required]
        [MaxLength(50)]
        public string Country { get; set; }
    }

    public class OrderReadDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserEmail { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
        public ShippingAddressDto ShippingAddress { get; set; }
        public BillingAddressDto BillingAddress { get; set; }
        public List<OrderItemReadDto> OrderItems { get; set; }
    }

    public class OrderItemReadDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? DiscountedPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class OrderUpdateStatusDto
    {
        [Required]
        public string Status { get; set; }
    }
}
