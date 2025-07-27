using System.Net.Mail;
using System.Net;

namespace DNA_API1.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage, byte[] attachment = null, string attachmentName = null)
        {
            var smtpClient = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential(
                    _config["EmailSettings:SenderEmail"],
                    _config["EmailSettings:SenderPassword"]
                ),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new MailAddress(_config["EmailSettings:SenderEmail"]),
                Subject = subject,
                Body = htmlMessage,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            if (attachment != null && !string.IsNullOrEmpty(attachmentName))
            {
                mailMessage.Attachments.Add(new Attachment(new MemoryStream(attachment), attachmentName, "application/pdf"));
            }

            await smtpClient.SendMailAsync(mailMessage);
        }
    }
}
