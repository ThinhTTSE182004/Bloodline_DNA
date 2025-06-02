using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("User_profile")]
[Index("Email", Name = "UQ__User_pro__AB6E61644B4B6EFE", IsUnique = true)]
[Index("UserId", Name = "UQ__User_pro__B9BE370E70888B0C", IsUnique = true)]
public partial class UserProfile
{
    [Key]
    [Column("profile_id")]
    public int ProfileId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Column("email")]
    [StringLength(100)]
    public string Email { get; set; } = null!;

    [Column("phone")]
    [StringLength(20)]
    public string? Phone { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at", TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserProfile")]
    public virtual User User { get; set; } = null!;
}
