using Caching;
using Xunit;

namespace KitVault.Tests;

public class CacheKeysTests
{
    [Fact]
    public void Blank_filter_is_a_wildcard()
    {
        Assert.Equal("*", CacheKeys.Norm(null));
        Assert.Equal("*", CacheKeys.Norm("  "));
        Assert.Equal("brazil", CacheKeys.Norm(" Brazil "));
    }

    [Fact]
    public void List_key_includes_the_stamp()
    {
        var key = CacheKeys.AuctionList(7, "Brazil", "Live", null);

        Assert.Equal("kv:auctions:list:7:brazil:live:*", key);
    }

    [Fact]
    public void Sheet_and_user_keys_are_stable()
    {
        var id = Guid.Parse("9c5b1e08-6a24-4d73-8f91-3e0b7c2a5466");

        Assert.Equal($"kv:auctions:{id:N}", CacheKeys.Auction(id));
        Assert.Equal($"kv:bids:{id:N}", CacheKeys.Bids(id));
        Assert.Equal("kv:sheet:3:kitvault", CacheKeys.Sheet(3, " KitVault "));
        Assert.Equal("kv:user:abc", CacheKeys.User("abc"));
    }
}
