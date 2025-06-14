﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Result")]
[Index("OrderDetailId", Name = "UQ__Result__3C5A4081EE29ECCB", IsUnique = true)]
public partial class Result
{
    [Key]
    [Column("result_id")]
    public int ResultId { get; set; }

    [Column("order_detail_id")]
    public int OrderDetailId { get; set; }

    [Column("report_date", TypeName = "datetime")]
    public DateTime? ReportDate { get; set; }

    [Column("test_summary", TypeName = "text")]
    public string? TestSummary { get; set; }

    [Column("raw_data_path")]
    [StringLength(255)]
    [Unicode(false)]
    public string? RawDataPath { get; set; }

    [Column("report_url")]
    public string? ReportUrl { get; set; }

    [Column("result_status")]
    [StringLength(50)]
    public string ResultStatus { get; set; } = null!;

    [Column("create_at", TypeName = "datetime")]
    public DateTime? CreateAt { get; set; }

    [Column("update_at", TypeName = "datetime")]
    public DateTime? UpdateAt { get; set; }

    [ForeignKey("OrderDetailId")]
    [InverseProperty("Result")]
    public virtual OrderDetail OrderDetail { get; set; } = null!;
}
