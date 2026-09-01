using Microsoft.EntityFrameworkCore;
using SearchService.Models;

namespace SearchService.Data;

public class SearchDbContext(DbContextOptions<SearchDbContext> options) : DbContext(options)
{
    public DbSet<Item> Items { get; set; }
    public DbSet<SavedPeg> SavedPegs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Club);
            entity.HasIndex(x => x.PlayerName);
            entity.Property(x => x.Seller).IsRequired();
            entity.Property(x => x.Status).IsRequired();
            entity.Property(x => x.Club).IsRequired();
            entity.Property(x => x.PlayerName).IsRequired();
            entity.Property(x => x.Season).IsRequired();
            entity.Property(x => x.Size).IsRequired();
            entity.Property(x => x.Color).IsRequired();
            entity.Property(x => x.KitType).IsRequired();
            entity.Property(x => x.Condition).IsRequired();
        });

        modelBuilder.Entity<SavedPeg>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Username);
            entity.Property(x => x.Username).IsRequired();
        });
    }
}
