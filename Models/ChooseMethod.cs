using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Keyless]
[Table("Choose_method")]
public partial class ChooseMethod
{
    [Column("service_package_id")]
    public int? ServicePackageId { get; set; }

    [Column("collection_method_id")]
    public int? CollectionMethodId { get; set; }

    [ForeignKey("CollectionMethodId")]
    public virtual CollectionMethod? CollectionMethod { get; set; }

    [ForeignKey("ServicePackageId")]
    public virtual ServicePackage? ServicePackage { get; set; }
}
