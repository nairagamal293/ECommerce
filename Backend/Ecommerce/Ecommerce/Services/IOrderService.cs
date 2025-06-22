using Ecommerce.DTOs;

namespace Ecommerce.Services
{
    public interface IOrderService
    {
        Task<OrderReadDto> CreateOrderAsync(string userId, OrderCreateDto orderCreateDto);
        Task<IEnumerable<OrderReadDto>> GetUserOrdersAsync(string userId);
        Task<OrderReadDto> GetOrderByIdAsync(string userId, int orderId);
        Task<IEnumerable<OrderReadDto>> GetAllOrdersAsync();
        Task<OrderReadDto> UpdateOrderStatusAsync(int orderId, OrderUpdateStatusDto orderUpdateStatusDto);
    }
}
