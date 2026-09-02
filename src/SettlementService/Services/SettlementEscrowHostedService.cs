namespace SettlementService.Services;

public sealed class SettlementEscrowHostedService(
    IServiceProvider services,
    ILogger<SettlementEscrowHostedService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await ReleaseOnceAsync(stoppingToken);

        using var timer = new PeriodicTimer(Interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
            await ReleaseOnceAsync(stoppingToken);
    }

    private async Task ReleaseOnceAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = services.CreateScope();
            var desks = scope.ServiceProvider.GetRequiredService<ISettlementsService>();
            var released = await desks.RequestOverdueReleasesAsync(stoppingToken);
            if (released > 0)
                logger.LogInformation("Asked the till to release hammer on {Count} overdue desk(s).", released);
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to release overdue escrow.");
        }
    }
}
