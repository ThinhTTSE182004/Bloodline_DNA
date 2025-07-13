using System.ComponentModel.DataAnnotations;

namespace DNA_API1.ViewModels
{
    public class BlogUpdateDTO
    {
        [Required]
        public int BlogId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; }

        [Required]
        public string Content { get; set; }

        public string ImageUrl { get; set; }
    }
} 