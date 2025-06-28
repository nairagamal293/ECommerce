using Ecommerce.DTOs;

namespace Ecommerce.Services
{
    public interface IAuthService
    {
        Task<UserReadDto> RegisterAsync(UserRegisterDto userRegisterDto);
        Task<string> LoginAsync(UserLoginDto userLoginDto);
        Task<UserReadDto> GetCurrentUserAsync(string userId);

        Task<IEnumerable<UserReadDto>> GetAllUsersAsync();
        Task<UserReadDto> UpdateUserAsync(string userId, UserUpdateDto userUpdateDto);
    }
}
