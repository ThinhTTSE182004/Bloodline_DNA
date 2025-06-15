using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Models;

[Table("Sample_transfer")]
public partial class SampleTransfer
{
    [Key]
    [Column("transfer_id")]
    public int TransferId { get; set; }

    [Column("staff_id")]
    public int StaffId { get; set; }

    [Column("medical_staff_id")]
    public int MedicalStaffId { get; set; }

    [Column("sample_id")]
    public int SampleId { get; set; }

    [Column("transfer_date", TypeName = "datetime")]
    public DateTime? TransferDate { get; set; }

    [Column("sample_transfer_status")]
    [StringLength(50)]
    public string SampleTransferStatus { get; set; } = null!;

    [ForeignKey("MedicalStaffId")]
    [InverseProperty("SampleTransferMedicalStaffs")]
    public virtual User MedicalStaff { get; set; } = null!;

    [ForeignKey("SampleId")]
    [InverseProperty("SampleTransfers")]
    public virtual Sample Sample { get; set; } = null!;

    [ForeignKey("StaffId")]
    [InverseProperty("SampleTransferStaffs")]
    public virtual User Staff { get; set; } = null!;
}
