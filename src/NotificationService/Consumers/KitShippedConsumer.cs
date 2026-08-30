using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class KitShippedConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<KitShippedConsumer> logger) : IConsumer<KitShipped>
{
    public async Task Consume(ConsumeContext<KitShipped> context)
    {
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("KitShipped", context.Message, context.CancellationToken);
        logger.LogInformation("Pushed kit shipped {Id}", context.Message.Id);
    }
}
