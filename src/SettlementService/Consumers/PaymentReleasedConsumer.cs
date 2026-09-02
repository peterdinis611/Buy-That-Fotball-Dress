using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SettlementService.Data;
using SettlementService.Entities;

namespace SettlementService.Consumers;

public class PaymentReleasedConsumer(
    SettlementDbContext db,
    IPublishEndpoint publishEndpoint,
    ILogger<PaymentReleasedConsumer> logger) : IConsumer<PaymentReleased>
{
    public async Task Consume(ConsumeContext<PaymentReleased> context)
    {
        var message = context.Message;
        var row = await db.Settlements.FirstOrDefaultAsync(
            x => x.Id == message.SettlementId,
            context.CancellationToken);
        if (row is null) return;

        if (string.IsNullOrWhiteSpace(row.PayoutRef))
            row.PayoutRef = message.PayoutRef;

        if (row.Status == DeskStatus.Shipped)
        {
            row.Status = DeskStatus.Received;
            row.ReceivedAt ??= message.ReleasedAt;
            await db.SaveChangesAsync(context.CancellationToken);
            await publishEndpoint.Publish(new SettlementReceived
            {
                Id = row.Id,
                AuctionId = row.AuctionId,
                ReceivedAt = row.ReceivedAt.Value
            }, context.CancellationToken);
            logger.LogInformation("Desk {Id} received after hammer payout {Ref}", row.Id, row.PayoutRef);
            return;
        }

        await db.SaveChangesAsync(context.CancellationToken);
    }
}
