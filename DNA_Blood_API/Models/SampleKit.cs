using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Sample_kit")]
[Index("KitCode", Name = "UQ__Sample_k__24769816C9764DD0", IsUnique = true)]
public partial class SampleKit
{
    [Key]
    [Column("sample_kit_id")]
    public int SampleKitId { get; set; }

    [Column("order_detail_id")]
    public int OrderDetailId { get; set; }

    [Column("staff_id")]
    public int StaffId { get; set; }

    [Column("name")]
    [StringLength(50)]
    public string Name { get; set; } = null!;

    [Column("intruction_url")]
    public string? IntructionUrl { get; set; }

    [Column("kit_code")]
    [StringLength(20)]
    [Unicode(false)]
    public string KitCode { get; set; } = null!;

    [Column("create_at", TypeName = "datetime")]
    public DateTime? CreateAt { get; set; }

    [Column("update_at", TypeName = "datetime")]
    public DateTime? UpdateAt { get; set; }

    [Column("send_date")]
    public DateOnly? SendDate { get; set; }

    [Column("received_date")]
    public DateOnly? ReceivedDate { get; set; }

    [ForeignKey("OrderDetailId")]
    [InverseProperty("SampleKits")]
    public virtual OrderDetail OrderDetail { get; set; } = null!;

    [ForeignKey("StaffId")]
    [InverseProperty("SampleKits")]
    public virtual User Staff { get; set; } = null!;
}
