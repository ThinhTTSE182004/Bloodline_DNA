using Microsoft.AspNetCore.Mvc;
using Login.Models;
using System.Linq;

namespace Login.Controllers
{
    public class ServicesController : Controller
    {
        private readonly BloodlineDnaContext _context;

        public ServicesController(BloodlineDnaContext context)
        {
            _context = context;
        }

        public IActionResult Index(int? id)
        {
            if (id == null)
            {
                // Trang tổng dịch vụ
                var services = _context.ServicePackages.ToList();
                return View(services);
            }
            else
            {
                // Trang chi tiết dịch vụ
                var service = _context.ServicePackages.FirstOrDefault(s => s.ServicePackageId == id);
                if (service == null) return NotFound();
                return View("Detail", service); // Có thể dùng chung view hoặc view riêng
            }
        }

        // Phương thức mới để trả về thông tin chi tiết dịch vụ dưới dạng JSON
        [HttpGet]
        public IActionResult Detail(int serviceId)
        {
            var service = _context.ServicePackages.FirstOrDefault(s => s.ServicePackageId == serviceId);
            if (service == null)
            {
                Console.WriteLine("Service not found");
                return NotFound();
            }
            
            // Log dữ liệu để kiểm tra
            Console.WriteLine($"Service ID: {service.ServicePackageId}, Name: {service.ServiceName}, Description: {service.Description}");
            
            return Json(service); // Trả về dữ liệu dưới dạng JSON
        }
    }
}
