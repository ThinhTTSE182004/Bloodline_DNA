using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

public partial class Order
{
    [Key]
    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("customer_id")]
    public int CustomerId { get; set; }

    [Column("collection_method_id")]
    public int CollectionMethodId { get; set; }

    [Column("order_status")]
    [StringLength(50)]
    public string OrderStatus { get; set; } = null!;

    [Column("booking_date", TypeName = "datetime")]
    public DateTime? BookingDate { get; set; }

    [Column("create_at", TypeName = "datetime")]
    public DateTime? CreateAt { get; set; }

    // [Column("update_at", TypeName = "datetime")]
    // public DateTime? UpdateAt { get; set; }

    [ForeignKey("CollectionMethodId")]
    [InverseProperty("Orders")]
    public virtual CollectionMethod CollectionMethod { get; set; } = null!;

    [ForeignKey("CustomerId")]
    [InverseProperty("Orders")]
    public virtual User Customer { get; set; } = null!;

    [InverseProperty("Order")]
    public virtual Delivery? Delivery { get; set; }

    [InverseProperty("Order")]
    public virtual Feedback? Feedback { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    [InverseProperty("Order")]
    public virtual Payment? Payment { get; set; }
}
