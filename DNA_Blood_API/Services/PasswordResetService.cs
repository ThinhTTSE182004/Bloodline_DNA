using System;
using System.Threading.Tasks;
using DNA_API1.Models;
using DNA_API1.Repository;
using DNA_API1.ViewModels;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DNA_API1.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _tokenRepository;
        private readonly IEmailService _emailService;
        private readonly BloodlineDnaContext _context;

        public PasswordResetService(
            IUserRepository userRepository,
            IPasswordResetTokenRepository tokenRepository,
            IEmailService emailService,
            BloodlineDnaContext context)
        {
            _userRepository = userRepository;
            _tokenRepository = tokenRepository;
            _emailService = emailService;
            _context = context;
        }

        public async Task SendForgotPasswordEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new Exception("Email không tồn tại trong hệ thống.");

            // Sinh token ngẫu nhiên
            var token = Guid.NewGuid().ToString();
            var expiry = DateTime.UtcNow.AddMinutes(15);

            // Lưu token vào DB
            var resetToken = new PasswordResetToken
            {
                UserId = user.UserId,
                Token = token,
                Expiry = expiry,
                IsUsed = false
            };
            await _tokenRepository.AddTokenAsync(resetToken);

            var resetLink = $"http://localhost:5173/reset-password?token={token}";
            var subject = "Đặt lại mật khẩu DNA Testing";
            var body = $"<p>Bạn hoặc ai đó đã yêu cầu đặt lại mật khẩu cho tài khoản này.</p>" +
                       $"<p>Nhấn vào <a href='{resetLink}'>đây</a> để đặt lại mật khẩu. Link có hiệu lực trong 15 phút.</p>";

            await _emailService.SendEmailAsync(email, subject, body);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var resetToken = await _tokenRepository.GetByTokenAsync(token);
            if (resetToken == null || resetToken.IsUsed || resetToken.Expiry < DateTime.UtcNow)
                throw new Exception("Token không hợp lệ hoặc đã hết hạn.");

            var user = await _context.Users.FindAsync(resetToken.UserId);
            if (user == null)
                throw new Exception("Người dùng không tồn tại.");

            var hasher = new PasswordHasher<User>();
            user.Password = hasher.HashPassword(user, newPassword);
            await _tokenRepository.MarkAsUsedAsync(resetToken.Id);
            await _context.SaveChangesAsync();
        }
    }
} 