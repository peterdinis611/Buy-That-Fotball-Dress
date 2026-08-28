using IdentityService.Data;
using IdentityService.Entities;
using MassTransit;
using Microsoft.AspNetCore.Identity;

namespace IdentityService.Data;

public sealed class IdentitySeedHostedService(
    IServiceProvider services,
    ILogger<IdentitySeedHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IdentityDataContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var publishEndpoint = scope.ServiceProvider.GetRequiredService<IPublishEndpoint>();

        try
        {
            await IdentitySeeder.SeedAsync(context, userManager, publishEndpoint, logger, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding identity.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
