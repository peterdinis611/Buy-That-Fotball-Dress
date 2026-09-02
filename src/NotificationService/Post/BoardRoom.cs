using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Post;

public sealed class BoardRoom(
    IHubContext<NotificationHub> hub,
    IBus bus) : IBoardRoom
{
    public async Task TellAsync(Tape tape, Letter? letter, CancellationToken cancellationToken)
    {
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("BoardTape", tape, cancellationToken);

        if (letter is null) return;

        await bus.Publish(new LetterRequested
        {
            ToUsername = letter.ToUsername,
            Subject = letter.Subject,
            Body = letter.Body,
            Kind = letter.Kind
        }, cancellationToken);
    }
}
