using Microsoft.EntityFrameworkCore;
using SettlementService.Entities;

namespace SettlementService.Data;

public class SettlementDbContext(DbContextOptions<SettlementDbContext> options) : DbContext(options)
{
    public DbSet<Settlement> Settlements { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Settlement>()
            .HasIndex(x => x.AuctionId)
            .IsUnique();

        modelBuilder.Entity<Settlement>()
            .HasIndex(x => x.Buyer);

        modelBuilder.Entity<Settlement>()
            .HasIndex(x => x.Seller);
    }
}
