using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace BidService.Data;

public class BidDbContextFactory : IDesignTimeDbContextFactory<BidDbContext>
{
    public BidDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<BidDbContext>();
        optionsBuilder.UseSqlite("Data Source=bid.db");

        return new BidDbContext(optionsBuilder.Options);
    }
}
