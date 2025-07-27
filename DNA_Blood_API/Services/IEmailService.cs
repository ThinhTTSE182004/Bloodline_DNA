﻿namespace DNA_API1.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage, byte[] attachment = null, string attachmentName = null);
    }
}
