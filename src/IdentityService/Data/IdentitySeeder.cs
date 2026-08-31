using Contracts;
using IdentityService.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Data;

public static class IdentitySeeder
{
    public const string DevPassword = "PitchSide!1";

    private static readonly (string Username, string Email, string DisplayName)[] Squad =
    [
        ("kitvault", "kitvault@kitvault.test", "Kit Vault"),
        ("jerseyhunter", "hunter@kitvault.test", "Jersey Hunter"),
        ("campnou.store", "campnou@kitvault.test", "Camp Nou Store"),
        ("anfield.kits", "anfield@kitvault.test", "Anfield Kits"),
        ("munich.matchworn", "munich@kitvault.test", "Munich Matchworn"),
        ("intermiami.official", "miami@kitvault.test", "Inter Miami Official"),
        ("oldtrafford.vault", "oldtrafford@kitvault.test", "Old Trafford Vault"),
        ("selecao.archive", "selecao@kitvault.test", "Selecao Archive"),
        ("tehelne.kits", "tehelne@kitvault.test", "Tehelne Kits"),
        ("steward", "steward@kitvault.test", "Match Steward")
    ];

    public static async Task SeedAsync(
        IdentityDataContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        if (await roleManager.FindByNameAsync(SquadRoles.Steward) is null)
        {
            var role = await roleManager.CreateAsync(new IdentityRole(SquadRoles.Steward));
            if (!role.Succeeded)
            {
                logger.LogWarning(
                    "Could not seed the steward role: {Errors}",
                    string.Join("; ", role.Errors.Select(e => e.Description)));
            }
        }

        var added = 0;
        foreach (var (username, email, displayName) in Squad)
        {
            if (await userManager.FindByNameAsync(username) is not null)
                continue;

            var user = new ApplicationUser
            {
                UserName = username,
                Email = email,
                DisplayName = displayName,
                EmailConfirmed = true
            };

            var created = await userManager.CreateAsync(user, DevPassword);
            if (!created.Succeeded)
            {
                logger.LogWarning(
                    "Could not seed {Username}: {Errors}",
                    username,
                    string.Join("; ", created.Errors.Select(e => e.Description)));
                continue;
            }

            added++;
        }

        var steward = await userManager.FindByNameAsync("steward");
        if (steward is not null && !await userManager.IsInRoleAsync(steward, SquadRoles.Steward))
        {
            var pinned = await userManager.AddToRoleAsync(steward, SquadRoles.Steward);
            if (!pinned.Succeeded)
            {
                logger.LogWarning(
                    "Could not pin steward: {Errors}",
                    string.Join("; ", pinned.Errors.Select(e => e.Description)));
            }
            else
            {
                logger.LogInformation("Steward is on the tunnel door.");
            }
        }

        if (added == 0)
        {
            logger.LogInformation("Identity squad is already on the sheet.");
            return;
        }

        logger.LogInformation("Seeded {Count} identity users. Dev password is PitchSide!1", added);
    }
}
