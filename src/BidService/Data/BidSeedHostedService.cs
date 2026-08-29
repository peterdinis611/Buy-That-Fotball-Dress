namespace BidService.Data;

public sealed class BidSeedHostedService(
    IServiceProvider services,
    ILogger<BidSeedHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<BidDbContext>();
        var http = scope.ServiceProvider.GetRequiredService<IHttpClientFactory>();

        try
        {
            await DbInitializer.InitializeAsync(context, http, logger, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding bids.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
