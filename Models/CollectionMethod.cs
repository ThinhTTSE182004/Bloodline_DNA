using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("Collection_method")]
public partial class CollectionMethod
{
    [Key]
    [Column("collection_method_id")]
    public int CollectionMethodId { get; set; }

    [Column("method_name")]
    [StringLength(20)]
    public string? MethodName { get; set; }

    [Column("TestTypeID")]
    public int TestTypeId { get; set; }

    [Column("description")]
    [StringLength(1000)]
    public string? Description { get; set; }

    [InverseProperty("CollectionMethod")]
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    [ForeignKey("TestTypeId")]
    [InverseProperty("CollectionMethods")]
    public virtual TestType TestType { get; set; } = null!;
}
