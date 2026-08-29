using BidService.Data;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace BidService.Consumers;

public class AuctionDeletedConsumer(BidDbContext db, ILogger<AuctionDeletedConsumer> logger)
    : IConsumer<AuctionDeleted>
{
    public async Task Consume(ConsumeContext<AuctionDeleted> context)
    {
        var lot = await db.Lots.FirstOrDefaultAsync(x => x.Id == context.Message.Id, context.CancellationToken);
        if (lot is not null)
            db.Lots.Remove(lot);

        var bids = await db.Bids.Where(x => x.AuctionId == context.Message.Id).ToListAsync(context.CancellationToken);
        db.Bids.RemoveRange(bids);

        await db.SaveChangesAsync(context.CancellationToken);
        logger.LogInformation("Removed lot {Id} from bidding", context.Message.Id);
    }
}
