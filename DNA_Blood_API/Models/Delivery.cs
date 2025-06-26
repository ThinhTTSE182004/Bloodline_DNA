using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Delivery")]
[Index("OrderId", Name = "UQ__Delivery__46596228D1773B2C", IsUnique = true)]
public partial class Delivery
{
    [Key]
    [Column("delivery_id")]
    public int DeliveryId { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("delivery_address")]
    [StringLength(255)]
    public string DeliveryAddress { get; set; } = null!;

    [Column("delivery_status")]
    [StringLength(50)]
    public string DeliveryStatus { get; set; } = null!;

    [Column("delivery_date")]
    public DateOnly DeliveryDate { get; set; }

    [Column("note")]
    public string? Note { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("Delivery")]
    public virtual Order Order { get; set; } = null!;
}
