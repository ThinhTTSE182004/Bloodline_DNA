using DNA_API1.Models;
using LoginAPI.Services;
using DNA_API1.Repository;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DNA_API1.Services;
using DNA_API1.Hubs;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using DNA_Blood_API.Services;
using DNA_Blood_API.Repository;
using QuestPDF.Infrastructure;

namespace DNA_API1
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Configure QuestPDF License
            QuestPDF.Settings.License = LicenseType.Community;
            
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddHttpClient();
            // Add services to the container.
            builder.Services.AddControllers();

            // Swagger/OpenAPI configuration
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new() { Title = "LoginAPI", Version = "v1" });

                // Cấu hình JWT trong Swagger
                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Description = "Nhập token dạng: Bearer {token}"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // Database context
            builder.Services.AddDbContext<BloodlineDnaContext>(option =>
                option.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

            // Đăng ký Authentication (JWT + Cookie + Google)
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddCookie()
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["AppSettings:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["AppSettings:Audience"],
                    ValidateLifetime = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)),
                    ValidateIssuerSigningKey = true
                };
            })
            .AddGoogle(options =>
            {
                options.ClientId = builder.Configuration["Authentication:Google:ClientId"];
                options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
                options.CallbackPath = "/signin-google";
            });

            // Repository Registration
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
            builder.Services.AddScoped<IRoleRepository, RoleRepository>();
            builder.Services.AddScoped<IServicePackageRepository, ServicePackageRepository>();
            builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<IStaffScheduleRepository, StaffScheduleRepository>();
            builder.Services.AddScoped<IResultRepository, ResultRepository>();
            builder.Services.AddScoped<IOrderDetailRepository, OrderDetailRepository>();
            builder.Services.AddScoped(typeof(DNA_API1.Repository.IRepository<>), typeof(DNA_API1.Repository.RepositoryBase<>));
            builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();
            builder.Services.AddScoped<IFeedbackResponseService, FeedbackResponseService>();
            builder.Services.AddScoped<IFeedbackResponseRepository, FeedbackResponseRepository>();
            builder.Services.AddScoped<IFeedbackRepository, FeedbackRepository>();
            builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
            builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
            builder.Services.AddScoped<IBlogRepository, BlogRepository>();
            builder.Services.AddScoped<ShiftAssignmentRepository>();

            // Service Registration
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IUserProfileService, UserProfileService>();
            builder.Services.AddScoped<ICartService, CartService>();
            builder.Services.AddScoped<IServiceService, ServicePackageService>();
            builder.Services.AddScoped<IStaffAssignmentService, StaffAssignmentService>();
            builder.Services.AddScoped<ISampleService, SampleService>();
            builder.Services.AddScoped<ISampleRepository, SampleRepository>();
            builder.Services.AddScoped<ISampleTransferRepository, SampleTransferRepository>();
            builder.Services.AddScoped<ISampleTransferService, SampleTransferService>();
            builder.Services.AddScoped<IResultService, ResultService>();
            builder.Services.AddScoped<IOrderDetailService, OrderDetailService>();
            builder.Services.AddScoped<IWorkShiftService, WorkShiftService>();
            builder.Services.AddScoped<IShiftAssignmentService, ShiftAssignmentService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
            builder.Services.AddScoped<IFeedbackService, FeedbackService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<IAdminDashboardService, AdminDashboardService>();
            builder.Services.AddScoped<IBlogService, BlogService>();

            // Add SignalR
            builder.Services.AddSignalR();

            // CORS
            //builder.Services.AddCors(options =>
            //{
            //    options.AddDefaultPolicy(policy =>
            //    {
            //        policy.WithOrigins(
            //            "http://localhost:5173",
            //            "http://localhost:5174",
            //            "http://localhost:3000",
            //            "https://localhost:3000"
            //        //"http://127.0.0.1:3000",
            //        //"https://127.0.0.1:3000"
            //        )
            //        .AllowCredentials()
            //        .AllowAnyHeader()
            //        .AllowAnyMethod();
            //    });
            //});

            //builder.Services.AddCors(options =>
            //{
            //    options.AddDefaultPolicy(policy =>
            //    {
            //        policy
            //            .AllowAnyOrigin()      // Cho phép tất cả các origin
            //            .AllowAnyHeader()
            //            .AllowAnyMethod();
            //        // Không dùng .AllowCredentials() với .AllowAnyOrigin()
            //    });
            //});


            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy
                        .WithOrigins(
                            "http://localhost:7113",
                            "http://localhost:5176",
                            "http://localhost:5173",
                            "http://localhost:5174",
                            "http://localhost:5175",

                            "http://localhost:3000"
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials(); // Cho phép credentials (Bearer token)
                });
            });
            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // Configure SignalR endpoint
            app.MapHub<UserHub>("/userHub").RequireCors("AllowFrontend");

            app.Run();
        }
    }
}
