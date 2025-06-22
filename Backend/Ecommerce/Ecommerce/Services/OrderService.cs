using AutoMapper;
using Ecommerce.Data;
using Ecommerce.DTOs;
using Ecommerce.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ICartService _cartService;
        private readonly UserManager<User> _userManager;

        public OrderService(
            ApplicationDbContext context,
            IMapper mapper,
            ICartService cartService,
            UserManager<User> userManager)
        {
            _context = context;
            _mapper = mapper;
            _cartService = cartService;
            _userManager = userManager;
        }

        public async Task<OrderReadDto> CreateOrderAsync(string userId, OrderCreateDto orderCreateDto)
        {
            // Get user's cart
            var cart = await _context.ShoppingCarts
                .Include(sc => sc.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(sc => sc.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new ApplicationException("Cart is empty");
            }

            // Check product availability
            foreach (var item in cart.CartItems)
            {
                if (item.Product.QuantityInStock < item.Quantity)
                {
                    throw new ApplicationException($"Product {item.Product.Name} has insufficient stock");
                }
            }

            // Create order
            var order = new Order
            {
                UserId = userId,
                Status = "Pending",
                PaymentMethod = orderCreateDto.PaymentMethod,
                PaymentStatus = "Pending",
                ShippingAddress = _mapper.Map<ShippingAddress>(orderCreateDto.ShippingAddress),
                BillingAddress = _mapper.Map<BillingAddress>(orderCreateDto.BillingAddress),
                OrderItems = cart.CartItems.Select(ci => new OrderItem
                {
                    ProductId = ci.ProductId,
                    Quantity = ci.Quantity,
                    UnitPrice = ci.Product.Price,
                    DiscountedPrice = ci.Product.DiscountedPrice
                }).ToList()
            };

            // Calculate total amount
            order.TotalAmount = order.OrderItems.Sum(oi =>
                oi.DiscountedPrice.HasValue ?
                oi.DiscountedPrice.Value * oi.Quantity :
                oi.UnitPrice * oi.Quantity);

            // Process payment (mock)
            order.PaymentStatus = await ProcessPaymentAsync(orderCreateDto.PaymentMethod, order.TotalAmount);

            // Reduce product quantities
            foreach (var item in cart.CartItems)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                product.QuantityInStock -= item.Quantity;
                product.IsAvailable = product.QuantityInStock > 0;
            }

            // Clear the cart
            await _cartService.ClearCartAsync(userId);

            // Save order
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return _mapper.Map<OrderReadDto>(order);
        }

        public async Task<IEnumerable<OrderReadDto>> GetUserOrdersAsync(string userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<OrderReadDto>>(orders);
        }

        public async Task<OrderReadDto> GetOrderByIdAsync(string userId, int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException("Order not found");
            }

            // Get the user to check roles
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                throw new UnauthorizedAccessException("User not found");
            }

            // Check if user is admin or the order belongs to them
            var isAdmin = await _userManager.IsInRoleAsync(user, "Admin");
            if (!isAdmin && order.UserId != userId)
            {
                throw new UnauthorizedAccessException("You don't have permission to view this order");
            }

            return _mapper.Map<OrderReadDto>(order);
        }




        public async Task<IEnumerable<OrderReadDto>> GetAllOrdersAsync()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<OrderReadDto>>(orders);
        }

        public async Task<OrderReadDto> UpdateOrderStatusAsync(int orderId, OrderUpdateStatusDto orderUpdateStatusDto)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                throw new KeyNotFoundException("Order not found");
            }

            order.Status = orderUpdateStatusDto.Status;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<OrderReadDto>(order);
        }

        private async Task<string> ProcessPaymentAsync(string paymentMethod, decimal amount)
        {
            // Mock payment processing
            await Task.Delay(500); // Simulate processing delay

            // Simulate different payment method behaviors
            return paymentMethod switch
            {
                "Cash" => "Pending", // Cash on delivery remains pending until marked as paid
                "Credit Card" => "Completed", // Assume credit card payments always succeed
                "Mada" => "Completed", // Assume Mada payments always succeed
                "Tabby" => "Pending", // BNPL services might have different statuses
                "Tamara" => "Pending", // BNPL services might have different statuses
                _ => "Failed" // Unknown payment method
            };
        }
    }
}
