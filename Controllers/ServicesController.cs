using Microsoft.AspNetCore.Mvc;
using Login.Models;

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
    }
}
