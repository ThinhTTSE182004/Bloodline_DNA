//using DNA_API1.Services;
//using DNA_API1.ViewModels;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;

//namespace DNA_API1.Controllers
//{
//    [Authorize(Roles = "Medical Staff")]
//    [Route("api/[controller]")]
//    [ApiController]
//    public class MedicalStaffController : ControllerBase
//    {
//        private readonly ISampleService _sampleService;

//        public MedicalStaffController(ISampleService sampleService)
//        {
//            _sampleService = sampleService;
//        }


//        [HttpPut("update-sample/{sampleId}")]
//        public async Task<IActionResult> UpdateSample(int sampleId, [FromBody] SampleUpdateViewModel model)
//        {
//            var success = await _sampleService.UpdateSampleStatusAsync(sampleId, model);
//            if (!success)
//                return NotFound("Sample not found");

//            return Ok("Sample updated successfully");
//        }
//    }
//}
