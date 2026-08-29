using BidService.Data;
using BidService.Mapping;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace BidService.Consumers;

public class AuctionUpdatedConsumer(BidDbContext db, ILogger<AuctionUpdatedConsumer> logger)
    : IConsumer<AuctionUpdated>
{
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        var lot = await db.Lots.FirstOrDefaultAsync(x => x.Id == context.Message.Id, context.CancellationToken);
        if (lot is null)
        {
            db.Lots.Add(context.Message.ToLot());
        }
        else
        {
            lot.Apply(context.Message);
        }

        await db.SaveChangesAsync(context.CancellationToken);
        logger.LogInformation("Updated lot {Id} for bidding", context.Message.Id);
    }
}
