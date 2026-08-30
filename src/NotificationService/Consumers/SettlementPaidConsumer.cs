using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Consumers;

public class SettlementPaidConsumer(
    IHubContext<NotificationHub> hub,
    ILogger<SettlementPaidConsumer> logger) : IConsumer<SettlementPaid>
{
    public async Task Consume(ConsumeContext<SettlementPaid> context)
    {
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("SettlementPaid", context.Message, context.CancellationToken);
        logger.LogInformation("Pushed desk paid {Id}", context.Message.Id);
    }
}
