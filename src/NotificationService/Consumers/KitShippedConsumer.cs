using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using NotificationService.Post;

namespace NotificationService.Consumers;

public class KitShippedConsumer(
    IHubContext<NotificationHub> hub,
    IBoardRoom room,
    ILogger<KitShippedConsumer> logger) : IConsumer<KitShipped>
{
    public async Task Consume(ConsumeContext<KitShipped> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("KitShipped", message, context.CancellationToken);

        var player = string.IsNullOrWhiteSpace(message.PlayerName) ? "Your shirt" : message.PlayerName;
        var tracking = string.IsNullOrWhiteSpace(message.Tracking) ? "no tracking yet" : message.Tracking;
        var href = $"/auctions/{message.AuctionId:D}";

        if (!string.IsNullOrWhiteSpace(message.Buyer))
        {
            await room.TellAsync(
                new Tape(
                    $"shipped-{message.Id:D}",
                    "shipped",
                    message.Buyer,
                    "Shipped",
                    player,
                    tracking,
                    href),
                new Letter(
                    message.Buyer,
                    $"{player} is on the way",
                    $"Tracking {tracking}. Confirm at the desk when it arrives.\n{href}"),
                context.CancellationToken);
        }

        logger.LogInformation("Pushed kit shipped {Id}", message.Id);
    }
}
