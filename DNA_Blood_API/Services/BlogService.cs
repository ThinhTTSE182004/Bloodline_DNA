using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace DNA_API1.Services
{
    public class BlogService : IBlogService
    {
        private readonly IBlogRepository _blogRepository;
        public BlogService(IBlogRepository blogRepository)
        {
            _blogRepository = blogRepository;
        }

        public async Task<IEnumerable<BlogDTO>> GetAllBlogsAsync()
        {
            var blogs = await _blogRepository.GetAllAsync();
            return blogs.Select(b => new BlogDTO
            {
                BlogId = b.BlogId,
                Title = b.Title,
                Content = b.Content,
                AuthorId = b.AuthorId,
                CreatedAt = b.CreatedAt,
                ImageUrl = b.ImageUrl 
            });
        }

        public async Task<BlogDTO> GetBlogByIdAsync(int id)
        {
            var b = await _blogRepository.GetByIdAsync(id);
            if (b == null) return null;
            return new BlogDTO
            {
                BlogId = b.BlogId,
                Title = b.Title,
                Content = b.Content,
                AuthorId = b.AuthorId,
                CreatedAt = b.CreatedAt,
                ImageUrl = b.ImageUrl
            };
        }

        public async Task AddBlogAsync(BlogCreateDTO blogCreateDto, int authorId)
        {
            var blog = new Blog
            {
                Title = blogCreateDto.Title,
                Content = blogCreateDto.Content,
                AuthorId = authorId,
                CreatedAt = System.DateTime.Now,
                ImageUrl = blogCreateDto.ImageUrl 
            };
            await _blogRepository.AddAsync(blog);
        }

        public async Task UpdateBlogAsync(BlogUpdateDTO blogUpdateDto)
        {
            var blog = await _blogRepository.GetByIdAsync(blogUpdateDto.BlogId);
            if (blog != null)
            {
                blog.Title = blogUpdateDto.Title;
                blog.Content = blogUpdateDto.Content;
                blog.ImageUrl = blogUpdateDto.ImageUrl; 
                await _blogRepository.UpdateAsync(blog);
            }
        }

        public async Task DeleteBlogAsync(int id)
        {
            await _blogRepository.DeleteAsync(id);
        }
    }
} 