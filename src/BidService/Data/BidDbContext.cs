using BidService.Entities;
using Microsoft.EntityFrameworkCore;

namespace BidService.Data;

public class BidDbContext(DbContextOptions<BidDbContext> options) : DbContext(options)
{
    public DbSet<Bid> Bids { get; set; }
    public DbSet<AuctionLot> Lots { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Bid>()
            .HasIndex(x => x.Bidder);

        modelBuilder.Entity<Bid>()
            .HasIndex(x => new { x.AuctionId, x.Amount });

        modelBuilder.Entity<AuctionLot>()
            .HasIndex(x => x.Status);
    }
}
