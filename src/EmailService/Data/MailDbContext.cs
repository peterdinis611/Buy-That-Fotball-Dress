using EmailService.Entities;
using Microsoft.EntityFrameworkCore;

namespace EmailService.Data;

public class MailDbContext(DbContextOptions<MailDbContext> options) : DbContext(options)
{
    public DbSet<Letter> Letters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Letter>()
            .HasIndex(x => x.ToUsername);
        modelBuilder.Entity<Letter>()
            .HasIndex(x => x.CreatedAt);
    }
}
