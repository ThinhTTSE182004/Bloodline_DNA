using DNA_API1.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Repository
{
    public interface IBlogRepository
    {
        Task<IEnumerable<Blog>> GetAllAsync();
        Task<Blog> GetByIdAsync(int id);
        Task AddAsync(Blog blog);
        Task UpdateAsync(Blog blog);
        Task DeleteAsync(int id);
    }
} 