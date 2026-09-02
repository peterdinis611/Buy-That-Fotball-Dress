using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using NotificationService.Post;

namespace NotificationService.Consumers;

public class AuctionUpdatedConsumer(
    IHubContext<NotificationHub> hub,
    IBoardRoom room,
    ILogger<AuctionUpdatedConsumer> logger) : IConsumer<AuctionUpdated>
{
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("AuctionUpdated", message, context.CancellationToken);

        if (string.Equals(message.Status, "Finished", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(message.Winner))
        {
            var player = string.IsNullOrWhiteSpace(message.PlayerName) ? "a shirt" : message.PlayerName;
            var amount = message.SoldAmount is int sold ? sold.ToString() : "the winning bid";
            var href = $"/auctions/{message.Id:D}";
            await room.TellAsync(
                new Tape(
                    $"won-{message.Id:D}",
                    "won",
                    message.Winner,
                    "You won",
                    player,
                    $"Pay {amount} plus desk at the till",
                    href),
                new Letter(
                    message.Winner,
                    $"You won {player}",
                    $"Highest bid when the clock hit zero. Pay {amount} plus desk at the till.\n{href}",
                    "won"),
                context.CancellationToken);
        }

        logger.LogInformation("Pushed auction update {AuctionId}", message.Id);
    }
}
