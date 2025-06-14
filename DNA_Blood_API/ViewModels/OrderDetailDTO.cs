using System;
using System.Collections.Generic;

namespace DNA_API1.ViewModels
{
    public class OrderDetailDTO
    {
        public int OrderDetailId { get; set; }
        public int ServicePackageId { get; set; }
        public string ServiceName { get; set; }
        public string ServiceDescription { get; set; }
        public decimal Price { get; set; }
        public string MedicalStaffName { get; set; }
        public string MedicalStaffPhone { get; set; }
        public string MedicalStaffEmail { get; set; }
        public List<SampleDTO> Samples { get; set; }
        public List<SampleKitDTO> SampleKits { get; set; }
        public ResultDTO Result { get; set; }
    }

    public class SampleDTO
    {
        public int SampleId { get; set; }
        public ParticipantDTO Participant { get; set; }
        public string SampleTypeName { get; set; }
        public string SampleTypeDescription { get; set; }
        public string StaffName { get; set; }
        public string StaffPhone { get; set; }
        public string StaffEmail { get; set; }
        public DateOnly? CollectedDate { get; set; }
        public DateOnly? ReceivedDate { get; set; }
        public string SampleStatus { get; set; }
        public string Note { get; set; }
    }

    public class ParticipantDTO
    {
        public int ParticipantId { get; set; }
        public string FullName { get; set; }
        public string Sex { get; set; }
        public DateOnly BirthDate { get; set; }
        public string Phone { get; set; }
        public string Relationship { get; set; }
        public string NameRelation { get; set; }
    }

    public class SampleKitDTO
    {
        public int SampleKitId { get; set; }
        public string Name { get; set; }
        public string KitCode { get; set; }
        public string InstructionUrl { get; set; }
        public string StaffName { get; set; }
        public string StaffPhone { get; set; }
        public string StaffEmail { get; set; }
        public DateOnly? SendDate { get; set; }
        public DateOnly? ReceivedDate { get; set; }
    }

    public class ResultDTO
    {
        public int ResultId { get; set; }
        public DateTime? ReportDate { get; set; }
        public string TestSummary { get; set; }
        public string RawDataPath { get; set; }
        public string ReportUrl { get; set; }
        public string ResultStatus { get; set; }
    }
}
