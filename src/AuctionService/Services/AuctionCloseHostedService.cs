namespace AuctionService.Services;

public sealed class AuctionCloseHostedService(
    IServiceProvider services,
    ILogger<AuctionCloseHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromSeconds(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await CloseOnceAsync(stoppingToken);

        using var timer = new PeriodicTimer(Interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
            await CloseOnceAsync(stoppingToken);
    }

    private async Task CloseOnceAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = services.CreateScope();
            var auctions = scope.ServiceProvider.GetRequiredService<IAuctionsService>();
            var closed = await auctions.CloseExpiredAsync(stoppingToken);
            if (closed > 0)
                logger.LogInformation("Closed {Count} expired lot(s).", closed);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to close expired auctions.");
        }
    }
}
