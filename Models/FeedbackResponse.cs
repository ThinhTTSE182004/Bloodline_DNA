using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("Feedback_response")]
public partial class FeedbackResponse
{
    [Key]
    [Column("response_id")]
    public int ResponseId { get; set; }

    [Column("feedback_id")]
    public int FeedbackId { get; set; }

    [Column("staff_id")]
    public int StaffId { get; set; }

    [Column("content_response")]
    [StringLength(1000)]
    public string? ContentResponse { get; set; }

    [Column("create_at", TypeName = "datetime")]
    public DateTime? CreateAt { get; set; }

    [Column("update_at", TypeName = "datetime")]
    public DateTime? UpdateAt { get; set; }

    [ForeignKey("FeedbackId")]
    [InverseProperty("FeedbackResponses")]
    public virtual Feedback Feedback { get; set; } = null!;

    [ForeignKey("StaffId")]
    [InverseProperty("FeedbackResponses")]
    public virtual User Staff { get; set; } = null!;
}
