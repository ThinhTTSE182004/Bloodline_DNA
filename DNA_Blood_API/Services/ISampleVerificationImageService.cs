using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface ISampleVerificationImageService
    {
        Task<UploadResult> UploadVerificationImageAsync(SampleVerificationImageCreateDTO model, int staffId);

        Task<IEnumerable<SampleVerificationImageDTO>> GetImageVMsBySampleIdAsync(int sampleId);

        Task<bool> VerifyImageAsync(int verificationImageId, SampleVerificationImageVerifyDTO model, int medicalStaffId);
        // ràng buộc staff khi muốn chuyển sang phòng lab
        Task<bool> HasAtLeastTwoVerificationImagesAsync(int sampleId);

        // Cái này ràng buộc cho medical khi muốn xác nhận đã nhận
        Task<bool> HasAtLeastTwoValidImagesAsync(int sampleId);
    }
}
