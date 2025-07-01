using Xunit;
using DNA_API1.ViewModels;
using LoginAPI.Services;
using Moq;
using DNA_API1.Models;
using DNA_API1.Repository;
using System.Threading.Tasks;

namespace DNA_Blood_API.Tests;

public class AuthServiceTests
{
    [Fact]
    public async Task RegisterAsync_ShouldReturnUserProfile_WhenValid()
    {
        // Arrange
        var userRepo = new Mock<IUserRepository>();
        var userProfileRepo = new Mock<IUserProfileRepository>();
        var roleRepo = new Mock<IRoleRepository>();
        var tokenService = new Mock<ITokenService>();

        userRepo.Setup(r => r.ExistsAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>())).ReturnsAsync(false);
        userRepo.Setup(r => r.AddAsync(It.IsAny<User>())).ReturnsAsync(new User { UserId = 1, Name = "Test", Email = "test@email.com", Phone = "1234567890", RoleId = 3 });
        userProfileRepo.Setup(r => r.AddAsync(It.IsAny<UserProfile>())).ReturnsAsync(new UserProfile { UserId = 1, Name = "Test", Email = "test@email.com", Phone = "1234567890" });

        var service = new AuthService(userRepo.Object, userProfileRepo.Object, roleRepo.Object, tokenService.Object);

        var dto = new RegisterDTO { Username = "Test", Password = "123456", Email = "test@email.com", Phone = "1234567890" };

        // Act
        var result = await service.RegisterAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Test", result.Name);
        Assert.Equal("test@email.com", result.Email);
    }

    [Fact]
    public async Task LoginAsync_ShouldReturnToken_WhenValid()
    {
        // Arrange
        var userRepo = new Mock<IUserRepository>();
        var userProfileRepo = new Mock<IUserProfileRepository>();
        var roleRepo = new Mock<IRoleRepository>();
        var tokenService = new Mock<ITokenService>();

        var user = new User { UserId = 1, Name = "Test", Email = "test@email.com", Password = new Microsoft.AspNetCore.Identity.PasswordHasher<User>().HashPassword(null, "123456"), RoleId = 3 };
        var role = new Role { RoleId = 3, RoleName = "Customer" };

        userRepo.Setup(r => r.GetByEmailAsync("test@email.com")).ReturnsAsync(user);
        roleRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(role);
        tokenService.Setup(t => t.CreateToken(user, role)).Returns("mocked-jwt-token");

        var service = new AuthService(userRepo.Object, userProfileRepo.Object, roleRepo.Object, tokenService.Object);

        var dto = new LoginDTO { Email = "test@email.com", Password = "123456" };

        // Act
        var result = await service.LoginAsync(dto);

        // Assert
        Assert.Equal("mocked-jwt-token", result);
    }
}
