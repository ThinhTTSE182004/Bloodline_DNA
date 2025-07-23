using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Blog")]
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

    [Column("created_at", TypeName = "datetime")]
    public DateTime CreatedAt { get; set; }

    [Column("imageUrl")]
    public string ImageUrl { get; set; }

    [ForeignKey("AuthorId")]
    [InverseProperty("Blogs")]
    public virtual User Author { get; set; }
}
