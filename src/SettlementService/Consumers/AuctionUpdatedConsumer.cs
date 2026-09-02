using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SettlementService.Data;
using SettlementService.Entities;

namespace SettlementService.Consumers;

public class AuctionUpdatedConsumer(
    SettlementDbContext db,
    IPublishEndpoint publishEndpoint,
    ILogger<AuctionUpdatedConsumer> logger) : IConsumer<AuctionUpdated>
{
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        var message = context.Message;
        if (!string.Equals(message.Status, "Finished", StringComparison.OrdinalIgnoreCase))
            return;
        if (string.IsNullOrWhiteSpace(message.Winner) || message.SoldAmount is null or <= 0)
            return;

        var exists = await db.Settlements.AnyAsync(x => x.AuctionId == message.Id, context.CancellationToken);
        if (exists) return;

        var now = DateTime.UtcNow;
        var hammer = message.SoldAmount.Value;
        var desk = HouseCut.Desk(hammer);
        var row = new Settlement
        {
            Id = Guid.NewGuid(),
            AuctionId = message.Id,
            Seller = message.Seller,
            Buyer = message.Winner,
            Hammer = hammer,
            Desk = desk,
            Amount = HouseCut.Due(hammer),
            Club = message.Club,
            PlayerName = message.PlayerName,
            Status = DeskStatus.Opened,
            OpenedAt = now
        };

        db.Settlements.Add(row);
        await db.SaveChangesAsync(context.CancellationToken);
        await publishEndpoint.Publish(new SettlementOpened
        {
            Id = row.Id,
            AuctionId = row.AuctionId,
            Seller = row.Seller,
            Buyer = row.Buyer,
            Amount = row.Amount,
            Club = row.Club,
            PlayerName = row.PlayerName,
            OpenedAt = row.OpenedAt
        }, context.CancellationToken);

        logger.LogInformation("Opened desk {Id} for lot {AuctionId}", row.Id, row.AuctionId);
    }
}
