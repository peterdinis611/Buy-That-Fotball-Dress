using AuctionService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Data;

public class AuctionDbContext(DbContextOptions<AuctionDbContext> options) : DbContext(options)
{
    public DbSet<Auction> Auctions { get; set; }
    public DbSet<AuctionBidder> AuctionBidders { get; set; }
    public DbSet<AuctionWatcher> AuctionWatchers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Auction>()
            .HasOne(x => x.Item)
            .WithOne(x => x.Auction)
            .HasForeignKey<Item>(x => x.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuctionBidder>()
            .HasKey(x => new { x.AuctionId, x.Bidder });

        modelBuilder.Entity<Auction>()
            .HasMany(x => x.Bidders)
            .WithOne(x => x.Auction)
            .HasForeignKey(x => x.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Item>()
            .HasIndex(x => x.Club);

        modelBuilder.Entity<AuctionBidder>()
            .HasIndex(x => x.Bidder);

        modelBuilder.Entity<AuctionWatcher>()
            .HasKey(x => new { x.AuctionId, x.Watcher });

        modelBuilder.Entity<Auction>()
            .HasMany(x => x.Watchers)
            .WithOne(x => x.Auction)
            .HasForeignKey(x => x.AuctionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AuctionWatcher>()
            .HasIndex(x => x.Watcher);
    }
}
