using Microsoft.EntityFrameworkCore;

namespace EmailService.Data;

public sealed class MailDbInitializer(
    IServiceProvider services,
    ILogger<MailDbInitializer> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<MailDbContext>();
        await db.Database.EnsureCreatedAsync(cancellationToken);
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Letters ADD COLUMN ReadAt TEXT",
                cancellationToken);
        }
        catch
        {
            // Column already exists on a fresh EnsureCreated database.
        }

        logger.LogInformation("Mail locker is on the shelf.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
