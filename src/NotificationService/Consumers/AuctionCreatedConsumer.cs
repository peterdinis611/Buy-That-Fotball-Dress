using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class AuctionCreatedConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<AuctionCreatedConsumer> logger) : IConsumer<AuctionCreated>
{
    public async Task Consume(ConsumeContext<AuctionCreated> context)
    {
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("AuctionCreated", context.Message, context.CancellationToken);

        logger.LogInformation("Pushed new auction {AuctionId}", context.Message.Id);
    }
}
