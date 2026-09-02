using Microsoft.EntityFrameworkCore;
using SettlementService.Data;
using SettlementService.Entities;

namespace SettlementService.Data;

public sealed class SettlementSeedHostedService(
    IServiceProvider services,
    ILogger<SettlementSeedHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SettlementDbContext>();
        await db.Database.EnsureCreatedAsync(cancellationToken);
        await TryAddPaymentRefAsync(db, cancellationToken);
        await TryAddCutColumnsAsync(db, cancellationToken);
        await TryAddPayoutRefAsync(db, cancellationToken);

        var auctionId = Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466");
        if (await db.Settlements.AnyAsync(x => x.AuctionId == auctionId, cancellationToken))
            return;

        db.Settlements.Add(new Settlement
        {
            Id = Guid.Parse("c0a1d2e3-4b56-7890-abcd-ef1234567890"),
            AuctionId = auctionId,
            Seller = "selecao.archive",
            Buyer = "kitvault",
            Hammer = 620,
            Desk = HouseCut.Desk(620),
            Amount = HouseCut.Due(620),
            Club = "Brazil",
            PlayerName = "Ronaldo Nazário",
            Status = DeskStatus.Opened,
            OpenedAt = DateTime.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded desk for sold Ronaldo lot.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static async Task TryAddPaymentRefAsync(SettlementDbContext db, CancellationToken cancellationToken)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Settlements ADD COLUMN PaymentRef TEXT",
                cancellationToken);
        }
        catch
        {
            // Column already exists on a fresh EnsureCreated database.
        }
    }

    private static async Task TryAddCutColumnsAsync(SettlementDbContext db, CancellationToken cancellationToken)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Settlements ADD COLUMN Hammer INTEGER NOT NULL DEFAULT 0",
                cancellationToken);
        }
        catch
        {
            // Column already exists.
        }

        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Settlements ADD COLUMN Desk INTEGER NOT NULL DEFAULT 0",
                cancellationToken);
        }
        catch
        {
            // Column already exists.
        }
    }

    private static async Task TryAddPayoutRefAsync(SettlementDbContext db, CancellationToken cancellationToken)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Settlements ADD COLUMN PayoutRef TEXT",
                cancellationToken);
        }
        catch
        {
            // Column already exists.
        }
    }
}
