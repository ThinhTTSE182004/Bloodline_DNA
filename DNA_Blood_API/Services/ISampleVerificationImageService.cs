using DNA_API1.Models;
using DNA_API1.ViewModels;

namespace DNA_API1.Services
{
    public interface ISampleVerificationImageService
    {
        Task<UploadResult> UploadVerificationImageAsync(SampleVerificationImageCreateDTO model, int staffId);

        Task<IEnumerable<SampleVerificationImageDTO>> GetImageVMsBySampleIdAsync(int sampleId);

        Task<bool> VerifyImageAsync(int verificationImageId, SampleVerificationImageVerifyDTO model, int medicalStaffId);

        Task<bool> HasAtLeastTwoVerificationImagesAsync(int sampleId);
    }
}
