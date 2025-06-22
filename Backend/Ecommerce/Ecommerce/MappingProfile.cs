using AutoMapper;
using Ecommerce.DTOs;
using Ecommerce.Models;

namespace Ecommerce
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Category Mappings
            CreateMap<CategoryCreateDto, Category>();
            CreateMap<CategoryUpdateDto, Category>();
            CreateMap<Category, CategoryReadDto>();

            // Product Mappings
            CreateMap<ProductCreateDto, Product>()
                .ForMember(dest => dest.IsAvailable,
                    opt => opt.MapFrom(src => src.QuantityInStock > 0));

            CreateMap<ProductUpdateDto, Product>()
                .ForMember(dest => dest.IsAvailable,
                    opt => opt.MapFrom(src => src.QuantityInStock > 0));

            CreateMap<Product, ProductReadDto>()
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category.Name));

            // User Mappings
            CreateMap<User, UserReadDto>();

            // Shopping Cart Mappings
            CreateMap<ShoppingCart, CartReadDto>();

            CreateMap<CartItem, CartItemReadDto>()
                .ForMember(dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductImageUrl,
                    opt => opt.MapFrom(src => src.Product.ImageUrl))
                .ForMember(dest => dest.Price,
                    opt => opt.MapFrom(src => src.Product.Price))
                .ForMember(dest => dest.DiscountedPrice,
                    opt => opt.MapFrom(src => src.Product.DiscountedPrice))
                .ForMember(dest => dest.TotalPrice,
                    opt => opt.MapFrom(src => src.Product.DiscountedPrice.HasValue ?
                        src.Product.DiscountedPrice.Value * src.Quantity :
                        src.Product.Price * src.Quantity));

            // Wishlist Mappings
            CreateMap<Wishlist, WishlistReadDto>();

            CreateMap<WishlistItem, WishlistItemReadDto>()
                .ForMember(dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductImageUrl,
                    opt => opt.MapFrom(src => src.Product.ImageUrl))
                .ForMember(dest => dest.Price,
                    opt => opt.MapFrom(src => src.Product.Price))
                .ForMember(dest => dest.DiscountedPrice,
                    opt => opt.MapFrom(src => src.Product.DiscountedPrice));

            // Order Mappings
            CreateMap<Order, OrderReadDto>()
                .ForMember(dest => dest.UserEmail,
                    opt => opt.MapFrom(src => src.User.Email));

            CreateMap<OrderItem, OrderItemReadDto>()
                .ForMember(dest => dest.ProductName,
                    opt => opt.MapFrom(src => src.Product.Name))
                .ForMember(dest => dest.ProductImageUrl,
                    opt => opt.MapFrom(src => src.Product.ImageUrl))
                .ForMember(dest => dest.TotalPrice,
                    opt => opt.MapFrom(src => src.DiscountedPrice.HasValue ?
                        src.DiscountedPrice.Value * src.Quantity :
                        src.UnitPrice * src.Quantity));

            CreateMap<ShippingAddress, ShippingAddressDto>();
            CreateMap<BillingAddress, BillingAddressDto>();
            CreateMap<ShippingAddressDto, ShippingAddress>();
            CreateMap<BillingAddressDto, BillingAddress>();

            // Payment Mappings (if you have payment DTOs)
            // CreateMap<Payment, PaymentReadDto>();
            // CreateMap<PaymentCreateDto, Payment>();
        }
    }
}
