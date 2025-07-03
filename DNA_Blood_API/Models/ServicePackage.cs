using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Service_package")]
[Index("ServiceName", Name = "UQ__Service___4A8EDF397E718B0B", IsUnique = true)]
public partial class ServicePackage
{
    [Key]
    [Column("service_package_id")]
    public int ServicePackageId { get; set; }

    [Required]
    [Column("service_name")]
    [StringLength(100)]
    public string ServiceName { get; set; }

    [Column("category")]
    [StringLength(100)]
    public string Category { get; set; }

    [Column("description")]
    public string Description { get; set; }

    [Column("duration")]
    public int? Duration { get; set; }

    [Column("processing_time_minutes")]
    public int ProcessingTimeMinutes { get; set; }

    [InverseProperty("ServicePackage")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("ServicePackage")]
    public virtual ICollection<ServicePrice> ServicePrices { get; set; } = new List<ServicePrice>();
}
