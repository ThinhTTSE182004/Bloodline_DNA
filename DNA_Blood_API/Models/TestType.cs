﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("TestType")]
public partial class TestType
{
    [Key]
    [Column("TestTypeID")]
    public int TestTypeId { get; set; }

    [Required]
    [StringLength(50)]
    public string Name { get; set; }

    [InverseProperty("TestType")]
    public virtual ICollection<CollectionMethod> CollectionMethods { get; set; } = new List<CollectionMethod>();
}
