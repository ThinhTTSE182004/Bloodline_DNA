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

        public async Task<UserProfileDTO> RegisterMedicalStaffAsync(RegisterMedicalStaff request)
        {
            if (await _userRepository.ExistsAsync(u => u.Email == request.Email))
                return null;

            var user = new User
            {
                Name = request.Username,
                Email = request.Email,
                Phone = request.Phone,
                RoleId = 4, // MedicalStaff = 4
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
                UpdatedAt = DateTime.Now,
                YearsOfExperience = request.YOE,
                Specialization = request.Specialization
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

        public async Task<UserProfileDTO> RegisterStaffAsync(RegisterDTO request)
        {
            if (await _userRepository.ExistsAsync(u => u.Email == request.Email))
                return null;

            var user = new User
            {
                Name = request.Username,
                Email = request.Email,
                Phone = request.Phone,
                RoleId = 2, // staff = 2
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

        public async Task<string> HandleGoogleLoginAsync(string email, string name)
        {
            if (string.IsNullOrEmpty(email))
                throw new ArgumentException("Email cannot be null");

            if (string.IsNullOrEmpty(name))
                name = "Google User";

            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    Name = name,
                    RoleId = 3,
                    Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                try
                {
                    user = await _userRepository.AddAsync(user);
                }
                catch (Exception ex)
                {
                    throw new Exception("Error saving new user: " + ex.InnerException?.Message ?? ex.Message);
                }

                var profile = new UserProfile
                {
                    UserId = user.UserId,
                    Name = name,
                    Email = email,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                try
                {
                    await _userProfileRepository.AddAsync(profile);
                }
                catch (Exception ex)
                {
                    throw new Exception("Error saving user profile: " + ex.InnerException?.Message ?? ex.Message);
                }
            }

            var role = await _roleRepository.GetByIdAsync(user.RoleId);
            return _tokenService.CreateToken(user, role);
        }
    }
}
