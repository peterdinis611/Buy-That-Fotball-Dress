using Microsoft.EntityFrameworkCore;
using PaymentService.Entities;

namespace PaymentService.Data;

public class PaymentDbContext(DbContextOptions<PaymentDbContext> options) : DbContext(options)
{
    public DbSet<Till> Tills { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Till>()
            .HasIndex(x => x.SettlementId)
            .IsUnique();

        modelBuilder.Entity<Till>()
            .HasIndex(x => x.AuctionId);

        modelBuilder.Entity<Till>()
            .HasIndex(x => x.Buyer);
    }
}
