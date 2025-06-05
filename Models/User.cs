using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("USERS")]
[Index("Email", Name = "UQ__USERS__AB6E616486853987", IsUnique = true)]
public partial class User
{
    [Key]
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

    [Column("password")]
    [StringLength(255)]
    public string Password { get; set; } = null!;

    [Column("role_id")]
    public int? RoleId { get; set; }

    [Column("created_at", TypeName = "datetime")]
    public DateTime? CreatedAt { get; set; }

    [Column("updated_at", TypeName = "datetime")]
    public DateTime? UpdatedAt { get; set; }

    [InverseProperty("Manager")]
    public virtual ICollection<DeliveryTask> DeliveryTaskManagers { get; set; } = new List<DeliveryTask>();

    [InverseProperty("Staff")]
    public virtual ICollection<DeliveryTask> DeliveryTaskStaffs { get; set; } = new List<DeliveryTask>();

    [InverseProperty("Staff")]
    public virtual ICollection<FeedbackResponse> FeedbackResponses { get; set; } = new List<FeedbackResponse>();

    [InverseProperty("MedicalStaff")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("Customer")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role? Role { get; set; }

    [InverseProperty("Staff")]
    public virtual ICollection<SampleKit> SampleKits { get; set; } = new List<SampleKit>();

    [InverseProperty("MedicalStaff")]
    public virtual ICollection<SampleTransfer> SampleTransferMedicalStaffs { get; set; } = new List<SampleTransfer>();

    [InverseProperty("Staff")]
    public virtual ICollection<SampleTransfer> SampleTransferStaffs { get; set; } = new List<SampleTransfer>();

    [InverseProperty("Staff")]
    public virtual ICollection<Sample> Samples { get; set; } = new List<Sample>();

    [InverseProperty("User")]
    public virtual UserProfile? UserProfile { get; set; }
}
