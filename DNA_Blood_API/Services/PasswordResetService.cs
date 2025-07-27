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
                throw new Exception("Email does not exist in the system.");

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
            var subject = "Password Reset Request - Bloodline DNA";

            var body = $@"
            <p>Hello,</p>
            <p>We received a request to reset the password associated with your account at <strong>Bloodline DNA</strong>.</p>
            <p>If you initiated this request, please click the link below to set a new password. For your security, this link will remain valid for only <strong>15 minutes</strong> from the time it was sent:</p>
            <p><a href='{resetLink}'>Reset your password</a></p>
            <p>If you did not request a password reset, no further action is needed. Simply disregard this email. Your account will remain secure and unchanged.</p>
            <p>If you have any questions or require assistance, feel free to contact our support team at any time. We are here to help.</p>
            <p>Thank you for choosing <strong>Bloodline DNA</strong>.</p>
            <p>Best regards,<br/>
            The Bloodline DNA Support Team</p>";


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