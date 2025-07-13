using System;

namespace DNA_API1.ViewModels
{
    public class BlogDTO
    {
        public int BlogId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public int AuthorId { get; set; }
        public DateTime CreatedAt { get; set; }

        public string ImageUrl { get; set; }
    }
} 