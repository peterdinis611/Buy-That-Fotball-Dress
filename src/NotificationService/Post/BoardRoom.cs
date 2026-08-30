using System.Net;
using System.Net.Http.Json;
using System.Net.Mail;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Post;

public sealed class BoardRoom(
    IHubContext<NotificationHub> hub,
    IHttpClientFactory http,
    IConfiguration config,
    ILogger<BoardRoom> logger) : IBoardRoom
{
    public async Task TellAsync(Tape tape, Letter? letter, CancellationToken cancellationToken)
    {
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("BoardTape", tape, cancellationToken);

        if (letter is null) return;

        var email = await LookupEmailAsync(letter.ToUsername, cancellationToken);
        logger.LogInformation(
            "Letter to {User} <{Email}>\n{Subject}\n{Body}",
            letter.ToUsername,
            email ?? "no mailbox",
            letter.Subject,
            letter.Body);

        if (email is null) return;
        await TrySmtpAsync(email, letter, cancellationToken);
    }

    private async Task<string?> LookupEmailAsync(string username, CancellationToken cancellationToken)
    {
        try
        {
            var client = http.CreateClient("IdentityService");
            var user = await client.GetFromJsonAsync<SquadMail>(
                $"/api/auth/users/{Uri.EscapeDataString(username)}",
                cancellationToken);
            return string.IsNullOrWhiteSpace(user?.Email) ? null : user.Email;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Could not look up mailbox for {User}", username);
            return null;
        }
    }

    private async Task TrySmtpAsync(string email, Letter letter, CancellationToken cancellationToken)
    {
        var host = config["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(host)) return;

        try
        {
            using var message = new MailMessage(
                config["Smtp:From"] ?? "board@kitvault.test",
                email,
                letter.Subject,
                letter.Body);
            using var smtp = new SmtpClient(host, int.TryParse(config["Smtp:Port"], out var port) ? port : 25)
            {
                EnableSsl = string.Equals(config["Smtp:Ssl"], "true", StringComparison.OrdinalIgnoreCase)
            };
            var user = config["Smtp:Username"];
            if (!string.IsNullOrWhiteSpace(user))
                smtp.Credentials = new NetworkCredential(user, config["Smtp:Password"]);

            await smtp.SendMailAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "SMTP failed for {Email}", email);
        }
    }

    private sealed class SquadMail
    {
        public string Email { get; set; } = string.Empty;
    }
}
