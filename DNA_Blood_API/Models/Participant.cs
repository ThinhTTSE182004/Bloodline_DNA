using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Participant")]
public partial class Participant
{
    [Key]
    [Column("participant_id")]
    public int ParticipantId { get; set; }

    [Column("full_name")]
    [StringLength(100)]
    public string? FullName { get; set; }

    [Column("sex")]
    [StringLength(10)]
    public string? Sex { get; set; }

    [Column("birth_date")]
    public DateOnly BirthDate { get; set; }

    [Column("phone")]
    [StringLength(12)]
    public string? Phone { get; set; }

    [Column("relationship")]
    [StringLength(30)]
    public string? Relationship { get; set; }

    [Column("name_relation")]
    [StringLength(30)]
    public string? NameRelation { get; set; }

    [InverseProperty("Participant")]
    public virtual ICollection<Sample> Samples { get; set; } = new List<Sample>();
}
