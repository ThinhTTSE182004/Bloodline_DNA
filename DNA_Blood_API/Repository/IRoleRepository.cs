using DNA_API1.Models;

namespace DNA_API1.Repository
{
    public interface IRoleRepository : IRepository<Role>
    {
        Task<Role> GetByIdAsync(int? roleId);
    }
} 