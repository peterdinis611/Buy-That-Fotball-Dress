using System.Net.Http.Json;
using Contracts;
using EmailService.Post;
using MassTransit;

namespace EmailService.Consumers;

public class LetterRequestedConsumer(
    IHttpClientFactory http,
    ILetterSender mail,
    ILogger<LetterRequestedConsumer> logger) : IConsumer<LetterRequested>
{
    public async Task Consume(ConsumeContext<LetterRequested> context)
    {
        var letter = context.Message;
        if (string.IsNullOrWhiteSpace(letter.ToUsername) || string.IsNullOrWhiteSpace(letter.Subject))
            return;

        var email = await LookupEmailAsync(letter.ToUsername, context.CancellationToken);
        if (email is null)
        {
            logger.LogInformation("No mailbox for {User}; letter stays on the board.", letter.ToUsername);
            return;
        }

        await mail.SendAsync(email, letter.ToUsername, letter.Subject, letter.Body, context.CancellationToken);
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

    private sealed class SquadMail
    {
        public string Email { get; set; } = string.Empty;
    }
}
