using DNA_API1.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DNA_API1.Services
{
    public interface IBlogService
    {
        Task<IEnumerable<BlogDTO>> GetAllBlogsAsync();
        Task<BlogDTO> GetBlogByIdAsync(int id);
        Task AddBlogAsync(BlogCreateDTO blogCreateDto, int authorId);
        Task UpdateBlogAsync(BlogUpdateDTO blogUpdateDto);
        Task DeleteBlogAsync(int id);
    }
} 