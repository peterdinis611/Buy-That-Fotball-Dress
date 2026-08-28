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
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SearchDbContext>();
        var items = scope.ServiceProvider.GetRequiredService<IItemRepository>();
        var syncValidator = scope.ServiceProvider.GetRequiredService<IValidator<AuctionSyncDto>>();
        var itemValidator = scope.ServiceProvider.GetRequiredService<IValidator<Item>>();

        await db.Database.MigrateAsync(cancellationToken);

        if (await items.CountAsync(cancellationToken) > 0)
        {
            logger.LogInformation("Search database already contains items, skipping HTTP sync.");
            return;
        }

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
