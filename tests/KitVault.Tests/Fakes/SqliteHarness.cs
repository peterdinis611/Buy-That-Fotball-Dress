using AuctionService.Data;
using BidService.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SearchService.Data;
using SettlementService.Data;
using PaymentService.Data;

namespace KitVault.Tests.Fakes;

public sealed class SqliteHarness<TContext> : IAsyncDisposable
    where TContext : DbContext
{
    public SqliteConnection Connection { get; }
    public TContext Db { get; }

    public SqliteHarness(Func<DbContextOptions<TContext>, TContext> factory)
    {
        Connection = new SqliteConnection("Data Source=:memory:");
        Connection.Open();
        var options = new DbContextOptionsBuilder<TContext>().UseSqlite(Connection).Options;
        Db = factory(options);
        Db.Database.EnsureCreated();
    }

    public ValueTask DisposeAsync()
    {
        Db.Dispose();
        Connection.Dispose();
        return ValueTask.CompletedTask;
    }
}

public static class SqliteHarness
{
    public static SqliteHarness<AuctionDbContext> Auction() =>
        new(options => new AuctionDbContext(options));

    public static SqliteHarness<BidDbContext> Bid() =>
        new(options => new BidDbContext(options));

    public static SqliteHarness<SearchDbContext> Search() =>
        new(options => new SearchDbContext(options));

    public static SqliteHarness<SettlementDbContext> Settlement() =>
        new(options => new SettlementDbContext(options));

    public static SqliteHarness<PaymentDbContext> Payment() =>
        new(options => new PaymentDbContext(options));
}
