using Login.Models;
using Login.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Login.Controllers
{
    [Authorize(Roles = "Customer")]
    public class CustomerController : Controller
    {
        private readonly ILogger<CustomerController> _logger;
        private readonly BloodlineDnaContext _context;
        public CustomerController(ILogger<CustomerController> logger, BloodlineDnaContext context)
        {
            _context = context;
            _logger = logger;
        }

        public IActionResult Profile()
        {
            if (!User.Identity.IsAuthenticated)
                return RedirectToAction("Login");

            int userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            var user = _context.Users.FirstOrDefault(u => u.UserId == userId);
            if (user == null)
                return NotFound();

            var orders = _context.Orders
                .Where(o => o.CustomerId == userId)
                .ToList();

            Console.WriteLine($"Orders for user {userId}: {orders.Count} đơn hàng");

            return View(new ProfileViewModel
            {
                User = user,
                Orders = orders
            });
        }
        [HttpGet]
        public async Task<IActionResult> AccountSettings()
        {
            int userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound();

            var model = new AccountSettingsViewModel
            {
                Name = user.Name,
                Email = user.Email,
                Phone = user.Phone
            };

            return View(model);
        }

        [HttpPost]
        public async Task<IActionResult> AccountSettings(AccountSettingsViewModel model)
        {
            if (!ModelState.IsValid)
                return View(model);

            int userId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null)
                return NotFound();

            user.Name = model.Name;
            user.Email = model.Email;
            user.Phone = model.Phone;


            await _context.SaveChangesAsync();

            ViewBag.SuccessMessage = "Cập nhật thành công!";
            return View(model);
        }





    }
}
