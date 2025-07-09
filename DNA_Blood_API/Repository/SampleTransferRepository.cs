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

        // Lấy sample và collection method trước
        var sample = await _context.Samples
            .Include(s => s.OrderDetail)
                .ThenInclude(od => od.Order)
                    .ThenInclude(o => o.CollectionMethod)
            .FirstOrDefaultAsync(s => s.SampleId == transfer.SampleId);

        if (sample == null) return new StatusChangeResult { Success = false, Message = "Sample not found." };

        var collectionMethod = sample.OrderDetail?.Order?.CollectionMethod?.MethodName;

        // Xác định flow trạng thái hợp lệ dựa trên collectionMethod
        Dictionary<string, string> nextStatus;
        if (collectionMethod == "At Medical Center")
        {
            nextStatus = new Dictionary<string, string>
            {
                { "Pending", "Collecting Sample" },
                { "Collecting Sample", "Delivering to Lab" },
                { "Delivering to Lab", "Received" },
                { "Received", "Complete" }
            };
        }
        else // At Home
        {
            nextStatus = new Dictionary<string, string>
            {
                { "Pending", "Delivering Kit" },
                { "Delivering Kit", "Collecting Sample" },
                { "Collecting Sample", "Delivering to Lab" },
                { "Delivering to Lab", "Received" },
                { "Received", "Complete" }
            };
        }

        // Kiểm tra flow hợp lệ trước khi cập nhật
        if (!nextStatus.TryGetValue(transfer.SampleTransferStatus, out var allowedNext) || allowedNext != newStatus)
            return new StatusChangeResult {
                Success = false,
                Message = $"Cannot change status from '{transfer.SampleTransferStatus}' to '{newStatus}'. Allowed next status: '{allowedNext}'."
            };

        // Cập nhật trạng thái SampleTransfer trước
        transfer.SampleTransferStatus = newStatus;

        // Mapping trạng thái SampleTransfer sang Sample
        Dictionary<string, string> sampleStatusMapping;
        if (collectionMethod == "At Medical Center")
        {
            sampleStatusMapping = new Dictionary<string, string>
            {
                { "Pending", "Pending" },
                { "Collecting Sample", "Collected" },
                { "Delivering to Lab", "InLab" },
                { "Received", "InLab" }
                // "Complete" thì giữ nguyên
            };
        }
        else // At Home
        {
            sampleStatusMapping = new Dictionary<string, string>
            {
                { "Pending", "Pending" },
                { "Delivering Kit", "WaitingForCollection" },
                { "Collecting Sample", "Collected" },
                { "Delivering to Lab", "InLab" },
                { "Received", "InLab" }
                // "Complete" thì giữ nguyên
            };
        }

        // Nếu trạng thái mới có mapping sang Sample thì cập nhật luôn
        if (sampleStatusMapping.TryGetValue(newStatus, out var sampleStatus))
        {
            var sample2 = await _context.Samples.FindAsync(transfer.SampleId);
            if (sample2 != null)
            {
                sample2.SampleStatus = sampleStatus;
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

