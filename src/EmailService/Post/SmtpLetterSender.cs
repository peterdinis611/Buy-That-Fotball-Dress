using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace EmailService.Post;

public sealed class SmtpLetterSender(IConfiguration config, ILogger<SmtpLetterSender> logger) : ILetterSender
{
    public async Task SendAsync(
        string toEmail,
        string toUsername,
        string subject,
        string body,
        CancellationToken cancellationToken = default)
    {
        logger.LogInformation(
            "Letter to {User} <{Email}>\n{Subject}\n{Body}",
            toUsername,
            toEmail,
            subject,
            body);

        var host = config["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(host))
            return;

        var from = config["Smtp:From"] ?? "board@kitvault.test";
        var port = int.TryParse(config["Smtp:Port"], out var parsed) ? parsed : 25;
        var ssl = string.Equals(config["Smtp:Ssl"], "true", StringComparison.OrdinalIgnoreCase);

        var message = new MimeMessage();
        message.From.Add(MailboxAddress.Parse(from));
        message.To.Add(new MailboxAddress(toUsername, toEmail));
        message.Subject = $"KIT VAULT · {subject}";
        message.Body = new TextPart("plain")
        {
            Text = $"KIT VAULT\n{subject}\n\n{body}\n"
        };

        try
        {
            using var smtp = new SmtpClient();
            var socket = ssl ? SecureSocketOptions.StartTls : SecureSocketOptions.None;
            await smtp.ConnectAsync(host, port, socket, cancellationToken);

            var user = config["Smtp:Username"];
            if (!string.IsNullOrWhiteSpace(user))
                await smtp.AuthenticateAsync(user, config["Smtp:Password"], cancellationToken);

            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "SMTP failed for {Email}", toEmail);
        }
    }
}
