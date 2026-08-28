using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AuctionService.Data;

public class AuctionDbContextFactory : IDesignTimeDbContextFactory<AuctionDbContext>
{
    public AuctionDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AuctionDbContext>();
        optionsBuilder.UseSqlite("Data Source=auction.db");

        return new AuctionDbContext(optionsBuilder.Options);
    }
}
