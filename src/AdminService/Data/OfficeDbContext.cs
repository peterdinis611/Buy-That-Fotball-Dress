using AdminService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Data;

public class OfficeDbContext(DbContextOptions<OfficeDbContext> options) : DbContext(options)
{
    public DbSet<ClipMark> Clip { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.Entity<ClipMark>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Steward).HasMaxLength(64);
            entity.Property(x => x.Verb).HasMaxLength(32);
            entity.Property(x => x.Subject).HasMaxLength(160);
            entity.Property(x => x.Detail).HasMaxLength(400);
            entity.HasIndex(x => x.At);
        });
    }
}
