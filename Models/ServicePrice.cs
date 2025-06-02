using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("Service_price")]
public partial class ServicePrice
{
    [Key]
    [Column("service_price_id")]
    public int ServicePriceId { get; set; }

    [Column("service_package_id")]
    public int ServicePackageId { get; set; }

    [Column("price")]
    public int Price { get; set; }

    [ForeignKey("ServicePackageId")]
    [InverseProperty("ServicePrices")]
    public virtual ServicePackage ServicePackage { get; set; } = null!;
}
