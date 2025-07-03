using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Sample_type")]
[Index("Name", Name = "UQ__Sample_t__72E12F1B3B02C42E", IsUnique = true)]
public partial class SampleType
{
    [Key]
    [Column("sample_type_id")]
    public int SampleTypeId { get; set; }

    [Required]
    [Column("name")]
    [StringLength(20)]
    public string Name { get; set; }

    [Column("description")]
    [StringLength(500)]
    public string Description { get; set; }

    [InverseProperty("SampleType")]
    public virtual ICollection<Sample> Samples { get; set; } = new List<Sample>();
}
