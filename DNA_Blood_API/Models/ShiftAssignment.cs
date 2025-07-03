using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("ShiftAssignment")]
public partial class ShiftAssignment
{
    [Key]
    [Column("assignment_id")]
    public int AssignmentId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("shift_id")]
    public int ShiftId { get; set; }

    [Column("assignment_date")]
    public DateOnly AssignmentDate { get; set; }

    [ForeignKey("ShiftId")]
    [InverseProperty("ShiftAssignments")]
    public virtual WorkShift Shift { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("ShiftAssignments")]
    public virtual User User { get; set; }
}
