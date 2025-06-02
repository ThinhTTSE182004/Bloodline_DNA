using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("Collection_method")]
[Index("MethodName", Name = "UQ__Collecti__2DA2FAEEBDD685A8", IsUnique = true)]
public partial class CollectionMethod
{
    [Key]
    [Column("collection_method_id")]
    public int CollectionMethodId { get; set; }

    [Column("method_name")]
    [StringLength(20)]
    public string MethodName { get; set; } = null!;

    [Column("testtype")]
    [StringLength(20)]
    public string TestType { get; set; } = null!;

    [Column("description")]
    [StringLength(1000)]
    public string? Description { get; set; }

    [InverseProperty("CollectionMethod")]
    public virtual Order? Order { get; set; }
}
