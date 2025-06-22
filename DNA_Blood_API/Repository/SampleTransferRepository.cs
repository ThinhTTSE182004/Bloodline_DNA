using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

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

    public async Task<bool> UpdateSampleTransferStatusAsync(int transferId, string newStatus)
    {
        var transfer = await _context.SampleTransfers.FindAsync(transferId);
        if (transfer == null) return false;

        transfer.SampleTransferStatus = newStatus;
        // Nếu muốn lưu thời gian bắt đầu chuyển:
        // transfer.StartTransferTime = DateTime.Now;

        return await _context.SaveChangesAsync() > 0;
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

