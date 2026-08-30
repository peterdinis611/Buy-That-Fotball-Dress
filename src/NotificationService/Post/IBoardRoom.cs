namespace NotificationService.Post;

public interface IBoardRoom
{
    Task TellAsync(Tape tape, Letter? letter, CancellationToken cancellationToken);
}
