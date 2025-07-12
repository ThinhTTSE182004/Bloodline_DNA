using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Blog")]
[Index("AuthorId", Name = "IX_Blog_AuthorId")]
public partial class Blog
{
    [Key]
    [Column("blog_id")]
    public int BlogId { get; set; }

    [Required]
    [Column("title")]
    [StringLength(255)]
    public string Title { get; set; }

    [Required]
    [Column("content")]
    public string Content { get; set; }

    [Column("author_id")]
    public int AuthorId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // Thêm thuộc tính này để lưu link ảnh Cloudinary
    [Column("imageUrl")]
    public string ImageUrl { get; set; }

    [ForeignKey("AuthorId")]
    [InverseProperty("Blogs")]
    public virtual User User { get; set; }
} 