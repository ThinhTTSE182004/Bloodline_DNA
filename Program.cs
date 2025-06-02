using Login.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;

namespace Login
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();
            // Add server
            builder.Services.AddDbContext<BloodlineDnaContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
            builder.Services.AddSession();
            // Scheme cookie, JWT, GG
            builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
               options.LoginPath = "/Account/Login";
               options.AccessDeniedPath = "/Login/AccessDenied";
               options.ExpireTimeSpan = TimeSpan.FromMinutes(30);
            });


            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();
            app.UseSession();
            app.UseAuthentication(); 
            app.UseAuthorization();


            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}
