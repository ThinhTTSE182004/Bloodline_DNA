using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Order_detail")]
public partial class OrderDetail
{
    [Key]
    [Column("order_detail_id")]
    public int OrderDetailId { get; set; }

    [Column("service_package_id")]
    public int ServicePackageId { get; set; }

    [Column("medical_staff_id")]
    public int MedicalStaffId { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("status")]
    [StringLength(50)]
    public string? Status { get; set; }

    [InverseProperty("OrderDetail")]
    public virtual ICollection<DeliveryTask> DeliveryTasks { get; set; } = new List<DeliveryTask>();

    [ForeignKey("MedicalStaffId")]
    [InverseProperty("OrderDetails")]
    public virtual User MedicalStaff { get; set; } = null!;

    [ForeignKey("OrderId")]
    [InverseProperty("OrderDetails")]
    public virtual Order Order { get; set; } = null!;

    [InverseProperty("OrderDetail")]
    public virtual Result? Result { get; set; }

    [InverseProperty("OrderDetail")]
    public virtual ICollection<SampleKit> SampleKits { get; set; } = new List<SampleKit>();

    [InverseProperty("OrderDetail")]
    public virtual ICollection<Sample> Samples { get; set; } = new List<Sample>();

    [ForeignKey("ServicePackageId")]
    [InverseProperty("OrderDetails")]
    public virtual ServicePackage ServicePackage { get; set; } = null!;
}
