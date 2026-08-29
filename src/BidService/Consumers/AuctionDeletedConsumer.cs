using BidService.Data;
using Caching;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace BidService.Consumers;

public class AuctionDeletedConsumer(
    BidDbContext db,
    IPitchCache cache,
    ILogger<AuctionDeletedConsumer> logger) : IConsumer<AuctionDeleted>
{
    public async Task Consume(ConsumeContext<AuctionDeleted> context)
    {
        var lot = await db.Lots.FirstOrDefaultAsync(x => x.Id == context.Message.Id, context.CancellationToken);
        if (lot is not null)
            db.Lots.Remove(lot);

        await db.SaveChangesAsync(context.CancellationToken);
        await cache.RemoveAsync(CacheKeys.Bids(context.Message.Id), context.CancellationToken);
        logger.LogInformation("Removed lot {Id} from bidding", context.Message.Id);
    }
}
