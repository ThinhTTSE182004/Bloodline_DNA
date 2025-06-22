﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Payment")]
[Index("OrderId", Name = "UQ__Payment__4659622870687370", IsUnique = true)]
public partial class Payment
{
    [Key]
    [Column("payment_id")]
    public int PaymentId { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("payment_method")]
    [StringLength(20)]
    public string PaymentMethod { get; set; } = null!;

    [Column("payment_status")]
    [StringLength(50)]
    public string PaymentStatus { get; set; } = null!;

    [Column("payment_date", TypeName = "datetime")]
    public DateTime? PaymentDate { get; set; }

    [Column("total")]
    public int Total { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("Payment")]
    public virtual Order Order { get; set; } = null!;
}
