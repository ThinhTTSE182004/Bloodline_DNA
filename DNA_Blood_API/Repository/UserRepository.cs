using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByNameAsync(string name);

        Task<Dictionary<int, string>> GetUserNamesByIdsAsync(IEnumerable<int> userIds);
    }

    public class UserRepository : RepositoryBase<User>, IUserRepository
    {
        public UserRepository(BloodlineDnaContext context) : base(context)
        {
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User> GetByNameAsync(string name)
        {
            return await _dbSet.FirstOrDefaultAsync(u => u.Name == name);
        }

        public async Task<Dictionary<int, string>> GetUserNamesByIdsAsync(IEnumerable<int> userIds)
        {
            return await _context.Users
                .Where(u => userIds.Contains(u.UserId))
                .ToDictionaryAsync(u => u.UserId, u => u.Name);
        }
    }
} 