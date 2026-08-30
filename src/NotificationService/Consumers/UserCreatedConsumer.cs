using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using NotificationService.Post;

namespace NotificationService.Consumers;

public class UserCreatedConsumer(
    IHubContext<NotificationHub> hub,
    IBoardRoom room,
    ILogger<UserCreatedConsumer> logger) : IConsumer<UserCreated>
{
    public async Task Consume(ConsumeContext<UserCreated> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("UserCreated", message, context.CancellationToken);

        var name = string.IsNullOrWhiteSpace(message.DisplayName) ? message.Username : message.DisplayName;
        await room.TellAsync(
            new Tape(
                message.Id,
                "listed",
                message.Username,
                "Squad",
                "On the sheet",
                $"{name} is in.",
                "/"),
            new Letter(
                message.Username,
                "You're on the sheet",
                $"Welcome to KIT VAULT, {name}. Hang a shirt or bid on one that's already on a peg."),
            context.CancellationToken);

        logger.LogInformation("Pushed new squad name {Username}", message.Username);
    }
}
