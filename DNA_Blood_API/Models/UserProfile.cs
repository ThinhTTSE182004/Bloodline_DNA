using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("User_profile")]
[Index("Email", Name = "UQ__User_pro__AB6E6164522928E6", IsUnique = true)]
[Index("UserId", Name = "UQ__User_pro__B9BE370E95CF3264", IsUnique = true)]
public partial class UserProfile
{
    [Key]
    [Column("profile_id")]
    public int ProfileId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("name")]
    [StringLength(100)]
    public string Name { get; set; }

    [Required]
    [Column("email")]
    [StringLength(100)]
    public string Email { get; set; }

    [Column("phone")]
    [StringLength(20)]
    public string Phone { get; set; }

    [StringLength(100)]
    public string Specialization { get; set; }

    public int? YearsOfExperience { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at", TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserProfile")]
    public virtual User User { get; set; }
}
