using BidService.Common;
using BidService.Data;
using BidService.DTOs;
using BidService.Entities;
using BidService.Mapping;
using Caching;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace BidService.Services;

public sealed class BidsService(
    BidDbContext db,
    IPublishEndpoint publishEndpoint,
    IHttpClientFactory httpClientFactory,
    IPitchCache cache) : IBidsService
{
    public async Task<IReadOnlyList<BidDto>> GetForAuctionAsync(Guid auctionId, CancellationToken cancellationToken)
    {
        return await cache.GetOrCreateAsync<List<BidDto>>(
            CacheKeys.Bids(auctionId),
            async cancel =>
            {
                var bids = await db.Bids
                    .AsNoTracking()
                    .Where(x => x.AuctionId == auctionId)
                    .OrderByDescending(x => x.Amount)
                    .ThenBy(x => x.CreatedAt)
                    .ToListAsync(cancel);

                return bids.Select(x => x.ToDto()).ToList();
            },
            CacheKeys.CatalogTtl,
            cancellationToken);
    }

    public async Task<Result<BidDto>> PlaceAsync(
        Guid auctionId,
        string bidder,
        int amount,
        CancellationToken cancellationToken)
    {
        if (amount <= 0)
            return Result<BidDto>.BadRequest("A bid has to be more than nothing.");

        var lot = await db.Lots.FirstOrDefaultAsync(x => x.Id == auctionId, cancellationToken)
            ?? await TryHydrateLotAsync(auctionId, cancellationToken);

        if (lot is null)
            return Result<BidDto>.NotFound("That shirt is not listed.");

        if (string.Equals(lot.Seller, bidder, StringComparison.OrdinalIgnoreCase))
            return Result<BidDto>.Forbidden("You cannot bid on your own shirt.");

        if (!string.Equals(lot.Status, "Live", StringComparison.OrdinalIgnoreCase)
            || lot.AuctionEnd.ToUniversalTime() <= DateTime.UtcNow)
            return Result<BidDto>.Conflict("This lot is no longer taking bids.");

        var highFromBids = await db.Bids
            .Where(x => x.AuctionId == auctionId)
            .Select(x => (int?)x.Amount)
            .MaxAsync(cancellationToken);

        var current = Math.Max(highFromBids ?? 0, lot.CurrentHighBid ?? 0);
        var floor = current > 0 ? current + 1 : lot.ReservePrice;
        if (amount < floor)
            return Result<BidDto>.BadRequest($"The next bid must be at least {floor}.");

        var previousBidder = await db.Bids
            .Where(x => x.AuctionId == auctionId)
            .OrderByDescending(x => x.Amount)
            .ThenBy(x => x.CreatedAt)
            .Select(x => x.Bidder)
            .FirstOrDefaultAsync(cancellationToken);

        var bid = new Bid
        {
            Id = Guid.NewGuid(),
            AuctionId = auctionId,
            Bidder = bidder,
            Amount = amount,
            CreatedAt = DateTime.UtcNow
        };

        db.Bids.Add(bid);
        if (lot.CurrentHighBid is not int high || amount > high)
            lot.CurrentHighBid = amount;
        await db.SaveChangesAsync(cancellationToken);

        var outbid = previousBidder is not null
            && !string.Equals(previousBidder, bidder, StringComparison.OrdinalIgnoreCase);
        await publishEndpoint.Publish(bid.ToBidPlaced(outbid ? previousBidder : null), cancellationToken);
        await cache.RemoveAsync(CacheKeys.Bids(auctionId), cancellationToken);

        return Result<BidDto>.Success(bid.ToDto());
    }

    private async Task<AuctionLot?> TryHydrateLotAsync(Guid auctionId, CancellationToken cancellationToken)
    {
        try
        {
            var client = httpClientFactory.CreateClient("AuctionService");
            var auction = await client.GetFromJsonAsync<AuctionSyncDto>(
                $"/api/auctions/{auctionId}",
                cancellationToken);

            if (auction is null)
                return null;

            var existing = await db.Lots.FirstOrDefaultAsync(x => x.Id == auctionId, cancellationToken);
            if (existing is not null)
                return existing;

            var lot = auction.ToLot();
            db.Lots.Add(lot);
            await db.SaveChangesAsync(cancellationToken);
            return lot;
        }
        catch
        {
            return null;
        }
    }
}
