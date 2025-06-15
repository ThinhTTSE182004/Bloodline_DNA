using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Service_package")]
[Index("ServiceName", Name = "UQ__Service___4A8EDF3933421B0E", IsUnique = true)]
public partial class ServicePackage
{
    [Key]
    [Column("service_package_id")]
    public int ServicePackageId { get; set; }

    [Column("service_name")]
    [StringLength(100)]
    public string ServiceName { get; set; } = null!;

    [Column("category")]
    [StringLength(100)]
    public string? Category { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [Column("duration")]
    public int? Duration { get; set; }

    [InverseProperty("ServicePackage")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("ServicePackage")]
    public virtual ICollection<ServicePrice> ServicePrices { get; set; } = new List<ServicePrice>();
}
