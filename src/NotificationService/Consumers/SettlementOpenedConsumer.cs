using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class SettlementOpenedConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<SettlementOpenedConsumer> logger) : IConsumer<SettlementOpened>
{
    public async Task Consume(ConsumeContext<SettlementOpened> context)
    {
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("SettlementOpened", context.Message, context.CancellationToken);
        logger.LogInformation("Pushed desk open {Id}", context.Message.Id);
    }
}
