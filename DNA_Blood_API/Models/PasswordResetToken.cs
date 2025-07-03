using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("PasswordResetToken")]
public partial class PasswordResetToken
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("token")]
    [StringLength(256)]
    public string Token { get; set; }

    [Column("expiry", TypeName = "datetime")]
    public DateTime Expiry { get; set; }

    [Column("is_used")]
    public bool IsUsed { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("PasswordResetTokens")]
    public virtual User User { get; set; }
}
