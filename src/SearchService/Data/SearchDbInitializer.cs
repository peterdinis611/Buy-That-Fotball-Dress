using SearchService.DTOs;
using SearchService.Mapping;

namespace SearchService.Data;

public sealed class SearchDbInitializer(
    IServiceProvider services,
    IHttpClientFactory httpClientFactory,
    ILogger<SearchDbInitializer> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var items = scope.ServiceProvider.GetRequiredService<IItemRepository>();

        if (await items.CountAsync(cancellationToken) > 0)
        {
            logger.LogInformation("Search index already contains items, skipping HTTP sync.");
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

            foreach (var auction in auctions)
                await items.UpsertAsync(auction.ToItem(), cancellationToken);

            logger.LogInformation("Synced {Count} items from AuctionService.", auctions.Count);
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
