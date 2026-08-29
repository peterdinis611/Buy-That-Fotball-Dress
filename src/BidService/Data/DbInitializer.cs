using BidService.DTOs;
using BidService.Entities;
using BidService.Mapping;
using Microsoft.EntityFrameworkCore;

namespace BidService.Data;

public static class DbInitializer
{
    public static readonly (Guid AuctionId, string Bidder, int Amount)[] SeedShots =
    [
        (Guid.Parse("0f6c8a21-5e44-4b7d-9c18-2d3a91e5b860"), "kitvault", 200),
        (Guid.Parse("7d2e9b54-1c80-4f36-a9d1-5b8c0e4f2173"), "kitvault", 230),
        (Guid.Parse("c3a1f4d2-8b6e-4c91-9f20-1a7b5e3d8c44"), "campnou.store", 280),
        (Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466"), "kitvault", 620),
        (Guid.Parse("5e7a2c14-8f39-41b6-ad50-2c9d6e1b8077"), "kitvault", 80)
    ];

    public static async Task InitializeAsync(
        BidDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);
        await SyncLotsAsync(context, httpClientFactory, logger, cancellationToken);
        await SeedBidsIfEmptyAsync(context, logger, cancellationToken);
    }

    private static async Task SyncLotsAsync(
        BidDbContext context,
        IHttpClientFactory httpClientFactory,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.Lots.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Bid service already tracks lots, skipping HTTP sync.");
            return;
        }

        List<AuctionSyncDto>? auctions = null;

        for (var attempt = 1; attempt <= 8; attempt++)
        {
            try
            {
                var client = httpClientFactory.CreateClient("AuctionService");
                auctions = await client.GetFromJsonAsync<List<AuctionSyncDto>>(
                    "/api/auctions",
                    cancellationToken);
                break;
            }
            catch (Exception ex) when (attempt < 8)
            {
                logger.LogInformation(
                    ex,
                    "AuctionService not ready for lot sync (attempt {Attempt}). Retrying…",
                    attempt);
                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Could not sync lots from AuctionService. RabbitMQ events will fill them.");
                return;
            }
        }

        if (auctions is null || auctions.Count == 0)
        {
            logger.LogInformation("AuctionService returned no lots to track.");
            return;
        }

        foreach (var auction in auctions)
        {
            if (await context.Lots.AnyAsync(x => x.Id == auction.Id, cancellationToken))
                continue;
            context.Lots.Add(auction.ToLot());
        }

        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Tracked {Count} lots from AuctionService.", auctions.Count);
    }

    private static async Task SeedBidsIfEmptyAsync(
        BidDbContext context,
        ILogger logger,
        CancellationToken cancellationToken)
    {
        if (await context.Bids.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Database already contains bids, skipping bid seed.");
            return;
        }

        var now = DateTime.UtcNow;
        var seeded = 0;

        foreach (var (auctionId, bidder, amount) in SeedShots)
        {
            var lot = await context.Lots.FirstOrDefaultAsync(x => x.Id == auctionId, cancellationToken);
            if (lot is null)
                continue;

            context.Bids.Add(new Bid
            {
                Id = Guid.NewGuid(),
                AuctionId = auctionId,
                Bidder = bidder,
                Amount = amount,
                CreatedAt = now.AddHours(-4)
            });

            if (lot.CurrentHighBid is not int high || amount > high)
                lot.CurrentHighBid = amount;

            seeded++;
        }

        if (seeded == 0)
            return;

        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded {Count} bids.", seeded);
    }
}
