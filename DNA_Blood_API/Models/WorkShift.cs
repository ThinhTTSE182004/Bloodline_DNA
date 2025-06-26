using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("WorkShift")]
public partial class WorkShift
{
    [Key]
    [Column("shift_id")]
    public int ShiftId { get; set; }

    [Column("shift_name")]
    [StringLength(50)]
    public string ShiftName { get; set; } = null!;

    [Column("start_time")]
    public TimeOnly StartTime { get; set; }

    [Column("end_time")]
    public TimeOnly EndTime { get; set; }

    [Column("description")]
    [StringLength(255)]
    public string? Description { get; set; }

    [InverseProperty("Shift")]
    public virtual ICollection<ShiftAssignment> ShiftAssignments { get; set; } = new List<ShiftAssignment>();
}
