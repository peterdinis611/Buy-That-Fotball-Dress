using AuctionService.Data;
using AuctionService.Entities;
using AuctionService.Mapping;
using Caching;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Consumers;

public class BidPlacedConsumer(
    AuctionDbContext db,
    IPublishEndpoint publishEndpoint,
    IPitchCache cache,
    ILogger<BidPlacedConsumer> logger) : IConsumer<BidPlaced>
{
    public async Task Consume(ConsumeContext<BidPlaced> context)
    {
        var message = context.Message;
        var auction = await db.Auctions
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == message.AuctionId, context.CancellationToken);

        if (auction is null)
        {
            logger.LogWarning(
                "Auction {AuctionId} was not found for bid {BidId}, skipping.",
                message.AuctionId,
                message.Id);
            return;
        }

        var isNewHigh = auction.CurrentHighBid is not int high || message.Amount > high;
        if (isNewHigh)
        {
            auction.CurrentHighBid = message.Amount;
            auction.HighBidder = message.Bidder;
            auction.UpdatedAt = DateTime.UtcNow;
        }

        var alreadyChasing = await db.AuctionBidders.AnyAsync(
            x => x.AuctionId == auction.Id && x.Bidder.ToLower() == message.Bidder.ToLower(),
            context.CancellationToken);

        if (!alreadyChasing)
        {
            db.AuctionBidders.Add(new AuctionBidder
            {
                AuctionId = auction.Id,
                Bidder = message.Bidder
            });
        }

        await db.SaveChangesAsync(context.CancellationToken);

        if (isNewHigh)
            await publishEndpoint.Publish(auction.ToAuctionUpdated(), context.CancellationToken);

        await cache.RemoveAsync(CacheKeys.Auction(auction.Id), context.CancellationToken);
        await cache.BumpAsync(CacheStamps.Auctions, context.CancellationToken);
        await cache.BumpAsync(CacheStamps.Sheets, context.CancellationToken);

        logger.LogInformation(
            "Applied bid {BidId} of {Amount} from {Bidder} on auction {AuctionId}",
            message.Id,
            message.Amount,
            message.Bidder,
            message.AuctionId);
    }
}
