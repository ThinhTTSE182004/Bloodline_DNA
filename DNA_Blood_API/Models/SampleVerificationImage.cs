using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Sample_Verification_Image")]
public partial class SampleVerificationImage
{
    [Key]
    [Column("verification_image_id")]
    public int VerificationImageId { get; set; }

    [Column("sample_id")]
    public int SampleId { get; set; }

    [Required]
    [Column("image_url")]
    [StringLength(500)]
    public string ImageUrl { get; set; }

    [Column("capture_time", TypeName = "datetime")]
    public DateTime CaptureTime { get; set; }

    [Column("captured_by")]
    public int CapturedBy { get; set; }

    [Required]
    [Column("verification_type")]
    [StringLength(100)]
    public string VerificationType { get; set; }

    [Column("verified_by")]
    public int? VerifiedBy { get; set; }

    [Column("verification_status")]
    [StringLength(50)]
    public string VerificationStatus { get; set; }

    [Column("note")]
    [StringLength(500)]
    public string Note { get; set; }

    [ForeignKey("CapturedBy")]
    [InverseProperty("SampleVerificationImageCapturedByNavigations")]
    public virtual User CapturedByNavigation { get; set; }

    [ForeignKey("SampleId")]
    [InverseProperty("SampleVerificationImages")]
    public virtual Sample Sample { get; set; }

    [ForeignKey("VerifiedBy")]
    [InverseProperty("SampleVerificationImageVerifiedByNavigations")]
    public virtual User VerifiedByNavigation { get; set; }
}
