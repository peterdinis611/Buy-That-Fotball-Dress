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
        ("campnou.store", "campnou@kitvault.test", "Camp Nou Store"),
        ("anfield.kits", "anfield@kitvault.test", "Anfield Kits"),
        ("munich.matchworn", "munich@kitvault.test", "Munich Matchworn"),
        ("intermiami.official", "miami@kitvault.test", "Inter Miami Official"),
        ("oldtrafford.vault", "oldtrafford@kitvault.test", "Old Trafford Vault"),
        ("selecao.archive", "selecao@kitvault.test", "Selecao Archive"),
        ("tehelne.kits", "tehelne@kitvault.test", "Tehelne Kits")
    ];

    public static async Task SeedAsync(
        IdentityDataContext context,
        UserManager<ApplicationUser> userManager,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        await context.Database.MigrateAsync(cancellationToken);

        if (await userManager.Users.AnyAsync(cancellationToken))
        {
            logger.LogInformation("Identity database already contains users, skipping seed.");
            return;
        }

        foreach (var (username, email, displayName) in Squad)
        {
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
        }

        logger.LogInformation("Seeded {Count} identity users. Dev password is PitchSide!1", Squad.Length);
    }
}
