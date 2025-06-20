using DNA_API1.Models;

namespace LoginAPI.Services
{
    public interface ITokenService
    {
        string CreateToken(User user, Role role);
    }
} 