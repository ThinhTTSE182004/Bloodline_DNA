using DNA_API1.Models;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Repository
{
    public class RoleRepository : RepositoryBase<Role>, IRoleRepository
    {
        public RoleRepository(BloodlineDnaContext context) : base(context)
        {
        }

        public async Task<Role> GetByIdAsync(int? roleId)
        {
            if (!roleId.HasValue)
                return null;
                
            return await _context.Roles.FirstOrDefaultAsync(r => r.RoleId == roleId.Value);
        }
    }
} 