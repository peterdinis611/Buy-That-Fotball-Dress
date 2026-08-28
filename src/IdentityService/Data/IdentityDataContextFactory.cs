using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace IdentityService.Data;

public class IdentityDataContextFactory : IDesignTimeDbContextFactory<IdentityDataContext>
{
    public IdentityDataContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<IdentityDataContext>();
        optionsBuilder.UseSqlite("Data Source=identity.db");

        return new IdentityDataContext(optionsBuilder.Options);
    }
}
