using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class AuctionDeletedConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<AuctionDeletedConsumer> logger) : IConsumer<AuctionDeleted>
{
    public async Task Consume(ConsumeContext<AuctionDeleted> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("AuctionDeleted", message, context.CancellationToken);

        logger.LogInformation("Pushed auction delete {AuctionId}", message.Id);
    }
}
