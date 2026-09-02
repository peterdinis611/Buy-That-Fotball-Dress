using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SettlementService.Data;
using SettlementService.Entities;

namespace SettlementService.Consumers;

public class PaymentCapturedConsumer(
    SettlementDbContext db,
    IPublishEndpoint publishEndpoint,
    ILogger<PaymentCapturedConsumer> logger) : IConsumer<PaymentCaptured>
{
    public async Task Consume(ConsumeContext<PaymentCaptured> context)
    {
        var message = context.Message;
        var row = await db.Settlements.FirstOrDefaultAsync(
            x => x.Id == message.SettlementId,
            context.CancellationToken);
        if (row is null) return;

        if (row.Status != DeskStatus.Opened)
        {
            if (string.IsNullOrWhiteSpace(row.PaymentRef) && !string.IsNullOrWhiteSpace(message.Slip))
            {
                row.PaymentRef = message.Slip;
                await db.SaveChangesAsync(context.CancellationToken);
            }

            return;
        }

        row.Status = DeskStatus.Paid;
        row.PaidAt = message.CapturedAt;
        row.PaymentRef = message.Slip;
        await db.SaveChangesAsync(context.CancellationToken);

        var hammer = row.Hammer > 0 ? row.Hammer : row.Amount;
        await publishEndpoint.Publish(new SettlementPaid
        {
            Id = row.Id,
            AuctionId = row.AuctionId,
            Seller = row.Seller,
            Buyer = row.Buyer,
            Amount = row.Amount,
            Hammer = hammer,
            Club = row.Club,
            PlayerName = row.PlayerName,
            PaymentRef = row.PaymentRef,
            PaidAt = row.PaidAt.Value
        }, context.CancellationToken);

        logger.LogInformation("Desk {Id} paid from till slip {Slip}", row.Id, row.PaymentRef);
    }
}
