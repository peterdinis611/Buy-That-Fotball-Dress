namespace Caching;

public static class CacheStamps
{
    public const string Auctions = "auctions";
    public const string Search = "search";
    public const string Sheets = "sheets";
}

public static class CacheKeys
{
    public static string AuctionList(long stamp, string? club, string? status, string? seller) =>
        $"kv:auctions:list:{stamp}:{Norm(club)}:{Norm(status)}:{Norm(seller)}";

    public static string Auction(Guid id) => $"kv:auctions:{id:N}";

    public static string Sheet(long stamp, string username) =>
        $"kv:sheet:{stamp}:{username.Trim().ToLowerInvariant()}";

    public static string Bids(Guid auctionId) => $"kv:bids:{auctionId:N}";

    public static string Search(long stamp, string fingerprint) => $"kv:search:{stamp}:{fingerprint}";

    public static string User(string id) => $"kv:user:{id}";

    public static readonly TimeSpan CatalogTtl = TimeSpan.FromMinutes(2);
    public static readonly TimeSpan SheetTtl = TimeSpan.FromMinutes(1);
    public static readonly TimeSpan UserTtl = TimeSpan.FromMinutes(2);

    public static string Norm(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "*" : value.Trim().ToLowerInvariant();
}
