namespace EmailService.Post;

public interface ILetterSender
{
    Task SendAsync(string toEmail, string toUsername, string subject, string body, CancellationToken cancellationToken = default);
}
