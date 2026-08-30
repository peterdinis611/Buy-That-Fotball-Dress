using FluentValidation;
using Microsoft.EntityFrameworkCore;
using SearchService.DTOs;
using SearchService.Mapping;
using SearchService.Models;

namespace SearchService.Data;

public sealed class SearchDbInitializer(
    IServiceProvider services,
    IHttpClientFactory httpClientFactory,
    ILogger<SearchDbInitializer> logger) : IHostedService
{
    private static readonly Guid[] SeededProvenanceLots =
    [
        Guid.Parse("c3a1f4d2-8b6e-4c91-9f20-1a7b5e3d8c44"),
        Guid.Parse("0f6c8a21-5e44-4b7d-9c18-2d3a91e5b860"),
        Guid.Parse("1a8d3f62-9e47-4c05-b2d8-7f13e6a90c55"),
        Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466"),
    ];

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SearchDbContext>();
        var items = scope.ServiceProvider.GetRequiredService<IItemRepository>();
        var syncValidator = scope.ServiceProvider.GetRequiredService<IValidator<AuctionSyncDto>>();
        var itemValidator = scope.ServiceProvider.GetRequiredService<IValidator<Item>>();

        await db.Database.MigrateAsync(cancellationToken);

        var indexedCount = await items.CountAsync(cancellationToken);
        var missingProvenance = indexedCount > 0 && await db.Items.AnyAsync(
            x => SeededProvenanceLots.Contains(x.Id) && x.Match == null,
            cancellationToken);

        if (indexedCount > 0 && !missingProvenance)
        {
            logger.LogInformation("Search database already contains items, skipping HTTP sync.");
            return;
        }

        if (missingProvenance)
            logger.LogInformation("Search index is missing provenance, refreshing from AuctionService.");

        try
        {
            var client = httpClientFactory.CreateClient("AuctionService");
            var auctions = await client.GetFromJsonAsync<List<AuctionSyncDto>>(
                "/api/auctions",
                cancellationToken);

            if (auctions is null || auctions.Count == 0)
            {
                logger.LogInformation("AuctionService returned no auctions to index.");
                return;
            }

            var indexed = 0;

            foreach (var auction in auctions)
            {
                var syncResult = await syncValidator.ValidateAsync(auction, cancellationToken);
                if (!syncResult.IsValid)
                {
                    logger.LogWarning(
                        "Skipping invalid auction {Id} from HTTP sync: {Errors}",
                        auction.Id,
                        string.Join("; ", syncResult.Errors.Select(e => e.ErrorMessage)));
                    continue;
                }

                var item = auction.ToItem();
                var itemResult = await itemValidator.ValidateAsync(item, cancellationToken);
                if (!itemResult.IsValid)
                {
                    logger.LogWarning(
                        "Skipping invalid item {Id} from HTTP sync: {Errors}",
                        item.Id,
                        string.Join("; ", itemResult.Errors.Select(e => e.ErrorMessage)));
                    continue;
                }

                await items.UpsertAsync(item, cancellationToken);
                indexed++;
            }

            logger.LogInformation("Synced {Count} items from AuctionService.", indexed);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Could not sync items from AuctionService. RabbitMQ events will fill the index.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
