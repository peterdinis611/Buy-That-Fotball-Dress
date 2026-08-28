using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace SearchService.Data;

public class SearchDbContextFactory : IDesignTimeDbContextFactory<SearchDbContext>
{
    public SearchDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<SearchDbContext>();
        optionsBuilder.UseSqlite("Data Source=search.db");

        return new SearchDbContext(optionsBuilder.Options);
    }
}
