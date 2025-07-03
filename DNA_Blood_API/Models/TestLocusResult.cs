using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Test_Locus_Result")]
public partial class TestLocusResult
{
    [Key]
    [Column("test_locus_id")]
    public int TestLocusId { get; set; }

    [Column("result_id")]
    public int ResultId { get; set; }

    [Column("locus_id")]
    public int LocusId { get; set; }

    [Column("person_a_alleles")]
    [StringLength(20)]
    public string PersonAAlleles { get; set; }

    [Column("person_b_alleles")]
    [StringLength(20)]
    public string PersonBAlleles { get; set; }

    [Column("is_match")]
    public bool? IsMatch { get; set; }

    [ForeignKey("LocusId")]
    [InverseProperty("TestLocusResults")]
    public virtual Locu Locus { get; set; }

    [ForeignKey("ResultId")]
    [InverseProperty("TestLocusResults")]
    public virtual Result Result { get; set; }
}
