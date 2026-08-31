using IdentityService.Entities;
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
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

        try
        {
            await IdentitySeeder.SeedAsync(context, userManager, roleManager, logger, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding identity.");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
