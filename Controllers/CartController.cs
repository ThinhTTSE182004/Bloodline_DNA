using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Login.Models;
using Microsoft.EntityFrameworkCore;

namespace Login.Controllers
{
    public class CartController : Controller
    {
        private readonly BloodlineDnaContext _context;

        public CartController(BloodlineDnaContext context)
        {
            _context = context;
        }

        public IActionResult ViewCart()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetServicePrice(int serviceId)
        {
            var price = await _context.ServicePrices
                .Where(sp => sp.ServicePackageId == serviceId)
                .Select(sp => sp.Price)
                .FirstOrDefaultAsync();

            return Json(new { price });
        }
    }
}