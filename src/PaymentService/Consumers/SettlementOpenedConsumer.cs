using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Entities;

namespace PaymentService.Consumers;

public class SettlementOpenedConsumer(
    PaymentDbContext db,
    ILogger<SettlementOpenedConsumer> logger) : IConsumer<SettlementOpened>
{
    public async Task Consume(ConsumeContext<SettlementOpened> context)
    {
        var message = context.Message;
        var exists = await db.Tills.AnyAsync(x => x.SettlementId == message.Id, context.CancellationToken);
        if (exists) return;

        db.Tills.Add(new Till
        {
            Id = Guid.NewGuid(),
            SettlementId = message.Id,
            AuctionId = message.AuctionId,
            Seller = message.Seller,
            Buyer = message.Buyer,
            Amount = message.Amount,
            Club = message.Club,
            PlayerName = message.PlayerName,
            Status = TillStatus.Held,
            OpenedAt = message.OpenedAt
        });
        await db.SaveChangesAsync(context.CancellationToken);
        logger.LogInformation("Opened till for desk {Id}", message.Id);
    }
}
