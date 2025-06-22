using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;

public class SampleTransferRepository : ISampleTransferRepository
{
    private readonly BloodlineDnaContext _context;

    public SampleTransferRepository(BloodlineDnaContext context)
    {
        _context = context;
    }

    public async Task CreateSampleTransferAsync(SampleTransfer sampleTransfer)
    {
        _context.SampleTransfers.Add(sampleTransfer);
        await _context.SaveChangesAsync();
    }

    public async Task<StatusChangeResult> UpdateSampleTransferStatusAsync(int transferId, string newStatus)
    {
        var transfer = await _context.SampleTransfers.FindAsync(transferId);
        if (transfer == null) return new StatusChangeResult { Success = false, Message = "Sample transfer not found." };

        // Định nghĩa flow chuyển đổi trạng thái hợp lệ
        var nextStatus = new Dictionary<string, string>
        {
            { "Pending", "Delivering Kit" },
            { "Delivering Kit", "Collecting Sample" },
            { "Collecting Sample", "Delivering to Lab" },
            { "Delivering to Lab", "Received" },
            { "Received", "Complete" }
        };

        // Kiểm tra chuyển đổi hợp lệ
        if (!nextStatus.TryGetValue(transfer.SampleTransferStatus, out var allowedNext) || allowedNext != newStatus)
            return new StatusChangeResult {
                Success = false,
                Message = $"Cannot change status from '{transfer.SampleTransferStatus}' to '{newStatus}'. Allowed next status: '{allowedNext}'."
            };

        transfer.SampleTransferStatus = newStatus;

        // Mapping trạng thái SampleTransfer sang Sample
        var sampleStatusMapping = new Dictionary<string, string>
        {
            { "Pending", "Pending" },
            { "Delivering Kit", "WaitingForCollection" },
            { "Collecting Sample", "Collected" },
            { "Delivering to Lab", "InLab" },
            { "Received", "InLab" }
            // "Complete" thì giữ nguyên
        };

        if (sampleStatusMapping.TryGetValue(newStatus, out var sampleStatus))
        {
            var sample = await _context.Samples.FindAsync(transfer.SampleId);
            if (sample != null)
            {
                sample.SampleStatus = sampleStatus;
            }
        }

        await _context.SaveChangesAsync();
        return new StatusChangeResult { Success = true, Message = $"Status changed to '{newStatus}' successfully." };
    }

    public async Task<List<SampleTransferDTO>> GetSampleTransfersByStaffIdAsync(int staffId)
    {
        return await _context.SampleTransfers
            .Where(t => t.StaffId == staffId)
            .Select(t => new SampleTransferDTO
            {
                // SỬA DÒNG NÀY:
                SampleTransferId = t.TransferId,
                SampleId = t.SampleId,
                SampleTypeName = t.Sample.SampleType.Name,
                KitCode = t.Sample.OrderDetail.SampleKits.FirstOrDefault().KitCode,
                SampleTransferStatus = t.SampleTransferStatus,
                StaffName = t.Staff.Name,
                MedicalStaffName = t.MedicalStaff.Name,
                TransferDate = t.TransferDate 
            })
            .ToListAsync();
    }

    public async Task<List<SampleTransferDTO>> GetSampleTransfersByMedicalStaffIdAsync(int medicalStaffId)
    {
        return await _context.SampleTransfers
            .Where(t => t.MedicalStaffId == medicalStaffId)
            .Select(t => new SampleTransferDTO
            {
                SampleTransferId = t.TransferId,
                SampleId = t.SampleId,
                SampleTypeName = t.Sample.SampleType.Name,
                KitCode = t.Sample.OrderDetail.SampleKits.FirstOrDefault().KitCode,
                SampleTransferStatus = t.SampleTransferStatus,
                StaffName = t.Staff.Name,
                MedicalStaffName = t.MedicalStaff.Name,
                TransferDate = t.TransferDate
            })
            .ToListAsync();
    }
}

