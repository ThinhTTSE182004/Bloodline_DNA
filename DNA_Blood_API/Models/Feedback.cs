using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Feedback")]
[Index("OrderId", Name = "UQ__Feedback__46596228824F8162", IsUnique = true)]
public partial class Feedback
{
    [Key]
    [Column("feedback_id")]
    public int FeedbackId { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("rating", TypeName = "decimal(2, 1)")]
    public decimal Rating { get; set; }

    [Column("comment")]
    [StringLength(1000)]
    public string? Comment { get; set; }

    [Column("create_at", TypeName = "datetime")]
    public DateTime? CreateAt { get; set; }

    [Column("update_at", TypeName = "datetime")]
    public DateTime? UpdateAt { get; set; }

    [InverseProperty("Feedback")]
    public virtual ICollection<FeedbackResponse> FeedbackResponses { get; set; } = new List<FeedbackResponse>();

    [ForeignKey("OrderId")]
    [InverseProperty("Feedback")]
    public virtual Order Order { get; set; } = null!;
}
