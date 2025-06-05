using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Login.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using Login.ViewModel;

namespace Login.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly BloodlineDnaContext _context;

    public HomeController(ILogger<HomeController> logger, BloodlineDnaContext context)
    {
        _logger = logger;
        _context = context;
    }


    public IActionResult Index()
    {
        // Lấy các gói dịch vụ phổ biến từ DB (ví dụ)
        var services = _context.ServicePackages
            .OrderByDescending(s => s.OrderDetails.Count)
            .Take(3)
            .ToList();

        return View(services); // Truyền sang view
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }

    // Trang tổng hợp dịch vụ (khi nhấn "Read more")
    public IActionResult Services(int? id)
    {
        if (id == null)
        {
            var allServices = _context.ServicePackages.ToList();
            return View("~/Views/Services/Index.cshtml", allServices);
        }
        else
        {
            var service = _context.ServicePackages.FirstOrDefault(s => s.ServicePackageId == id);
            if (service == null) return NotFound();
            return View("~/Views/Services/Detail.cshtml", service);
        }
    }

    // Trang blog
    public IActionResult Blog()
    {
        // Lấy danh sách bài viết blog nếu có
        // var blogs = _context.Blogs.ToList();
        // return View(blogs);
        return View();
    }

    // Trang hướng dẫn
    public IActionResult Guide()
    {
        return View();
    }
}
