using Login.Models;
using Login.ViewModel;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;

namespace Login.Controllers
{
    public class AccountController : Controller
    {
        private readonly BloodlineDnaContext _context;
        public AccountController(BloodlineDnaContext context)
        {
            _context = context;
        }

        // REGISTER
        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model); 
            }

            // Kiểm tra email trùng
            if (_context.Users.Any(u => u.Email == model.Email))
            {
                ModelState.AddModelError("Email", "Email already exists.");
                return View(model);
            }

            // Tạo user mới
            var user = new User
            {
                Name = model.Name,
                Email = model.Email,
                Password = model.Password, 
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                RoleId = 3,
                Phone = model.Phone
            };

            _context.Users.Add(user);
            _context.SaveChanges();

            return RedirectToAction("Login", "Account");
        }
        
        // LOGIN 
        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(string email, string password)
        {
            
            var user = _context.Users
                .Include(u => u.Role) // Lay thong tin Role 
                .FirstOrDefault(u => u.Email == email && u.Password == password);

            if (user != null)
            {
                var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "Customer"),
                new Claim("UserId", user.UserId.ToString())
            };

                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var authProperties = new AuthenticationProperties
                {
                    IsPersistent = true,
                    // Cookies lâu dài
                    ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(30)
                };
                
                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(identity),
                    authProperties);

                if (user.Role?.RoleName == "Admin")
                {
                    return RedirectToAction("Dashboard", "Admin");
                }

                else if (user.Role?.RoleName == "Customer")
                {
                    return RedirectToAction("Index", "Home");
                }
                else
                {
                    return RedirectToAction("Index", "Home");
                }
            }
            else
            {
                ViewBag.Error = "Incorrect Email or password!";
                return View();
            }
        }




        // LOGOUT
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Home");
        }
    }
}
