using AuctionService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Data;

public class AuctionDbContext(DbContextOptions<AuctionDbContext> options) : DbContext(options)
{
    public DbSet<Auction> Auctions { get; set; }
    public DbSet<Bid> Bids { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Auction>()
            .HasOne(x => x.Item)
            .WithOne(x => x.Auction)
            .HasForeignKey<Item>(x => x.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Auction>()
            .HasMany(x => x.Bids)
            .WithOne(x => x.Auction)
            .HasForeignKey(x => x.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Item>()
            .HasIndex(x => x.Club);

        modelBuilder.Entity<Bid>()
            .HasIndex(x => x.Bidder);

        modelBuilder.Entity<Bid>()
            .HasIndex(x => new { x.AuctionId, x.Amount });
    }
}
