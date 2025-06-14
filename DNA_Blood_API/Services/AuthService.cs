using DNA_API1.Models;
using DNA_API1.ViewModels;
using DNA_API1.Repository;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace LoginAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserProfileRepository _userProfileRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly ITokenService _tokenService;

        public AuthService(
            IUserRepository userRepository,
            IUserProfileRepository userProfileRepository,
            IRoleRepository roleRepository,
            ITokenService tokenService)
        {
            _userRepository = userRepository;
            _userProfileRepository = userProfileRepository;
            _roleRepository = roleRepository;
            _tokenService = tokenService;
        }

        public async Task<string> LoginAsync(LoginDTO request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user is null)
            {
                return null;
            }
            if (new PasswordHasher<User>().VerifyHashedPassword(user, user.Password, request.Password)
                == PasswordVerificationResult.Failed)
            {
                return null;
            }

            var role = await _roleRepository.GetByIdAsync(user.RoleId);
            return _tokenService.CreateToken(user, role);
        }

        public async Task<UserProfileDTO> RegisterAsync(RegisterDTO request)
        {
            if (await _userRepository.ExistsAsync(u => u.Email == request.Email))
                return null;

            var user = new User
            {
                Name = request.Username,
                Email = request.Email,
                Phone = request.Phone,
                RoleId = 3,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            user.Password = new PasswordHasher<User>().HashPassword(user, request.Password);

            var createdUser = await _userRepository.AddAsync(user);

            var profile = new UserProfile
            {
                UserId = createdUser.UserId,
                Name = createdUser.Name,
                Email = createdUser.Email,
                Phone = createdUser.Phone,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };

            var createdProfile = await _userProfileRepository.AddAsync(profile);

            return new UserProfileDTO
            {
                UserId = createdProfile.UserId,
                Name = createdProfile.Name,
                Email = createdProfile.Email,
                Phone = createdProfile.Phone,
                CreatedAt = createdProfile.CreatedAt,
                UpdatedAt = createdProfile.UpdatedAt
            };
        }
    }
}
