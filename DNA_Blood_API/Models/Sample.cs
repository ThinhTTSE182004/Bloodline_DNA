using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

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

    [Required]
    [Column("sample_status")]
    [StringLength(50)]
    public string SampleStatus { get; set; }

    [Column("note")]
    [StringLength(500)]
    public string Note { get; set; }

    [ForeignKey("OrderDetailId")]
    [InverseProperty("Samples")]
    public virtual OrderDetail OrderDetail { get; set; }

    [ForeignKey("ParticipantId")]
    [InverseProperty("Samples")]
    public virtual Participant Participant { get; set; }

    [InverseProperty("Sample")]
    public virtual ICollection<SampleTransfer> SampleTransfers { get; set; } = new List<SampleTransfer>();

    [ForeignKey("SampleTypeId")]
    [InverseProperty("Samples")]
    public virtual SampleType SampleType { get; set; }

    [InverseProperty("Sample")]
    public virtual ICollection<SampleVerificationImage> SampleVerificationImages { get; set; } = new List<SampleVerificationImage>();

    [ForeignKey("StaffId")]
    [InverseProperty("Samples")]
    public virtual User Staff { get; set; }
}
