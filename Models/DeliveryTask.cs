using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("Delivery_task")]
public partial class DeliveryTask
{
    [Key]
    [Column("task_id")]
    public int TaskId { get; set; }

    [Column("order_detail_id")]
    public int OrderDetailId { get; set; }

    [Column("manager_id")]
    public int ManagerId { get; set; }

    [Column("staff_id")]
    public int StaffId { get; set; }

    [Column("assigned_at", TypeName = "datetime")]
    public DateTime? AssignedAt { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [Column("delivery_task_status")]
    [StringLength(50)]
    public string DeliveryTaskStatus { get; set; } = null!;

    [Column("complete_at")]
    public DateOnly? CompleteAt { get; set; }

    [ForeignKey("ManagerId")]
    [InverseProperty("DeliveryTaskManagers")]
    public virtual User Manager { get; set; } = null!;

    [ForeignKey("OrderDetailId")]
    [InverseProperty("DeliveryTasks")]
    public virtual OrderDetail OrderDetail { get; set; } = null!;

    [ForeignKey("StaffId")]
    [InverseProperty("DeliveryTaskStaffs")]
    public virtual User Staff { get; set; } = null!;
}
