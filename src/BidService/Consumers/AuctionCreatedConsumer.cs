using BidService.Data;
using BidService.Mapping;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace BidService.Consumers;

public class AuctionCreatedConsumer(BidDbContext db, ILogger<AuctionCreatedConsumer> logger)
    : IConsumer<AuctionCreated>
{
    public async Task Consume(ConsumeContext<AuctionCreated> context)
    {
        var lot = context.Message.ToLot();
        var existing = await db.Lots.FirstOrDefaultAsync(x => x.Id == lot.Id, context.CancellationToken);
        if (existing is null)
            db.Lots.Add(lot);
        else
        {
            existing.Seller = lot.Seller;
            existing.ReservePrice = lot.ReservePrice;
            existing.AuctionEnd = lot.AuctionEnd;
            existing.Status = lot.Status;
        }

        await db.SaveChangesAsync(context.CancellationToken);
        logger.LogInformation("Tracked lot {Id} for bidding", lot.Id);
    }
}
