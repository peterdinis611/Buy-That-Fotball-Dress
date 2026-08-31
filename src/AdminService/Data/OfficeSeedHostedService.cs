using AdminService.Data;

namespace AdminService.Data;

public sealed class OfficeSeedHostedService(
    IServiceProvider services,
    ILogger<OfficeSeedHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OfficeDbContext>();
        try
        {
            await db.Database.EnsureCreatedAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not open the steward clip.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
