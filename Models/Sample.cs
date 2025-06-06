﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Login.Models;

[Table("samples")]
public partial class Sample
{
    [Key]
    [Column("sample_id")]
    public int SampleId { get; set; }

    [Column("participant_id")]
    public int? ParticipantId { get; set; }

    [Column("sample_type_id")]
    public int SampleTypeId { get; set; }

    [Column("staff_id")]
    public int StaffId { get; set; }

    [Column("order_detail_id")]
    public int OrderDetailId { get; set; }

    [Column("collected_date")]
    public DateOnly? CollectedDate { get; set; }

    [Column("received_date")]
    public DateOnly? ReceivedDate { get; set; }

    [Column("sample_status")]
    [StringLength(50)]
    public string SampleStatus { get; set; } = null!;

    [Column("note")]
    [StringLength(500)]
    public string? Note { get; set; }

    [ForeignKey("OrderDetailId")]
    [InverseProperty("Samples")]
    public virtual OrderDetail OrderDetail { get; set; } = null!;

    [ForeignKey("ParticipantId")]
    [InverseProperty("Samples")]
    public virtual Participant? Participant { get; set; }

    [ForeignKey("SampleTypeId")]
    [InverseProperty("Samples")]
    public virtual SampleType SampleType { get; set; } = null!;

    [ForeignKey("StaffId")]
    [InverseProperty("Samples")]
    public virtual User Staff { get; set; } = null!;
}
