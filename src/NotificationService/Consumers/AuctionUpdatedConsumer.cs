using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class AuctionUpdatedConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<AuctionUpdatedConsumer> logger) : IConsumer<AuctionUpdated>
{
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("AuctionUpdated", message, context.CancellationToken);

        logger.LogInformation("Pushed auction update {AuctionId}", message.Id);
    }
}
