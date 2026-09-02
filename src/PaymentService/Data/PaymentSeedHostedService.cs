using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.Entities;

namespace PaymentService.Data;

public sealed class PaymentSeedHostedService(
    IServiceProvider services,
    ILogger<PaymentSeedHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
        await db.Database.EnsureCreatedAsync(cancellationToken);
        await TryAddEscrowColumnsAsync(db, cancellationToken);

        var settlementId = Guid.Parse("c0a1d2e3-4b56-7890-abcd-ef1234567890");
        if (await db.Tills.AnyAsync(x => x.SettlementId == settlementId, cancellationToken))
            return;

        db.Tills.Add(new Till
        {
            Id = Guid.Parse("a1b2c3d4-5e67-8901-bcde-f12345678901"),
            SettlementId = settlementId,
            AuctionId = Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466"),
            Seller = "selecao.archive",
            Buyer = "kitvault",
            Amount = 682,
            Hammer = 620,
            Club = "Brazil",
            PlayerName = "Ronaldo Nazário",
            Status = TillStatus.Held,
            OpenedAt = DateTime.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync(cancellationToken);
        logger.LogInformation("Seeded till for the Ronaldo desk.");
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private static async Task TryAddEscrowColumnsAsync(PaymentDbContext db, CancellationToken cancellationToken)
    {
        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Tills ADD COLUMN Hammer INTEGER NOT NULL DEFAULT 0",
                cancellationToken);
        }
        catch
        {
            // Column already exists.
        }

        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Tills ADD COLUMN PayoutRef TEXT",
                cancellationToken);
        }
        catch
        {
            // Column already exists.
        }

        try
        {
            await db.Database.ExecuteSqlRawAsync(
                "ALTER TABLE Tills ADD COLUMN ReleasedAt TEXT",
                cancellationToken);
        }
        catch
        {
            // Column already exists.
        }
    }
}
