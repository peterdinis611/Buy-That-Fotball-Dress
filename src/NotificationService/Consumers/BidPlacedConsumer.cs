using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class BidPlacedConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<BidPlacedConsumer> logger) : IConsumer<BidPlaced>
{
    public async Task Consume(ConsumeContext<BidPlaced> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("BidPlaced", message, context.CancellationToken);

        logger.LogInformation(
            "Pushed bid {BidId} of {Amount} on auction {AuctionId}",
            message.Id,
            message.Amount,
            message.AuctionId);
    }
}
