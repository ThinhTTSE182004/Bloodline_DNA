using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User> GetByEmailAsync(string email);
        Task<User> GetByNameAsync(string name);
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
    }
} 