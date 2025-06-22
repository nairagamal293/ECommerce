using Ecommerce.DTOs;
using Ecommerce.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Ecommerce.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserReadDto>> Register(UserRegisterDto userRegisterDto)
        {
            var user = await _authService.RegisterAsync(userRegisterDto);
            return CreatedAtAction(nameof(GetCurrentUser), user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserLoginDto userLoginDto)
        {
            var token = await _authService.LoginAsync(userLoginDto);
            return Ok(new { Token = token });
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<UserReadDto>>> GetAllUsers()
        {
            var users = await _authService.GetAllUsersAsync();
            return Ok(users);
        }


        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserReadDto>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _authService.GetCurrentUserAsync(userId);
            return Ok(user);
        }
    }
}
