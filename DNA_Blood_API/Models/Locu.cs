using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Index("LocusName", Name = "UQ__Locus__66D38AD387EE9295", IsUnique = true)]
public partial class Locu
{
    [Key]
    [Column("locus_id")]
    public int LocusId { get; set; }

    [Required]
    [Column("locus_name")]
    [StringLength(50)]
    public string LocusName { get; set; }

    [Column("description")]
    [StringLength(255)]
    public string Description { get; set; }

    [InverseProperty("Locus")]
    public virtual ICollection<TestLocusResult> TestLocusResults { get; set; } = new List<TestLocusResult>();
}
