using Caching;
using Microsoft.EntityFrameworkCore;
using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Data;

public sealed class ItemRepository(SearchDbContext db, IPitchCache cache) : IItemRepository
{
    public async Task UpsertAsync(Item item, CancellationToken cancellationToken)
    {
        var existing = await db.Items.FindAsync([item.Id], cancellationToken);

        if (existing is null)
        {
            db.Items.Add(item);
        }
        else
        {
            db.Entry(existing).CurrentValues.SetValues(item);
        }

        await db.SaveChangesAsync(cancellationToken);
        await cache.BumpAsync(CacheStamps.Search, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await db.Items.FindAsync([id], cancellationToken);
        if (item is null)
            return;

        db.Items.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        await cache.BumpAsync(CacheStamps.Search, cancellationToken);
    }

    public async Task<PagedResult<Item>> SearchAsync(SearchQuery query, CancellationToken cancellationToken)
    {
        var stamp = await cache.StampAsync(CacheStamps.Search, cancellationToken);
        return await cache.GetOrCreateAsync(
            CacheKeys.Search(stamp, Fingerprint(query)),
            cancel => QueryAsync(query, cancel),
            CacheKeys.CatalogTtl,
            cancellationToken);
    }

    public Task<long> CountAsync(CancellationToken cancellationToken) =>
        db.Items.LongCountAsync(cancellationToken);

    private async Task<PagedResult<Item>> QueryAsync(SearchQuery query, CancellationToken cancellationToken)
    {
        var items = db.Items.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Club))
        {
            var club = query.Club.Trim().ToLower();
            items = items.Where(x => x.Club.ToLower().Contains(club));
        }

        if (!string.IsNullOrWhiteSpace(query.PlayerName))
        {
            var player = query.PlayerName.Trim().ToLower();
            items = items.Where(x => x.PlayerName.ToLower().Contains(player));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = query.Status.Trim().ToLower();
            items = items.Where(x => x.Status.ToLower() == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Size))
        {
            var size = query.Size.Trim().ToUpper();
            items = items.Where(x => x.Size.ToUpper() == size);
        }

        if (!string.IsNullOrWhiteSpace(query.KitType))
        {
            var kitType = query.KitType.Trim().ToLower();
            items = items.Where(x => x.KitType.ToLower() == kitType);
        }

        if (!string.IsNullOrWhiteSpace(query.Condition))
        {
            var condition = query.Condition.Trim().ToLower();
            items = items.Where(x => x.Condition.ToLower() == condition);
        }

        if (!string.IsNullOrWhiteSpace(query.Season))
        {
            var season = query.Season.Trim();
            items = items.Where(x => x.Season == season);
        }

        if (!string.IsNullOrWhiteSpace(query.League))
        {
            var league = query.League.Trim().ToLower();
            items = items.Where(x => x.League != null && x.League.ToLower().Contains(league));
        }

        if (query.MinPrice is not null)
            items = items.Where(x => (x.CurrentHighBid ?? x.ReservePrice) >= query.MinPrice);

        if (query.MaxPrice is not null)
            items = items.Where(x => (x.CurrentHighBid ?? x.ReservePrice) <= query.MaxPrice);

        var totalCount = await items.LongCountAsync(cancellationToken);

        var sorted = Sort(items, query.Sort);

        var results = await sorted
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<Item>
        {
            Results = results,
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount
        };
    }

    private static IOrderedQueryable<Item> Sort(IQueryable<Item> items, string? sort)
    {
        return sort?.Trim().ToLowerInvariant() switch
        {
            "newest" => items.OrderByDescending(x => x.CreatedAt),
            "priceasc" => items.OrderBy(x => x.CurrentHighBid ?? x.ReservePrice).ThenBy(x => x.AuctionEnd),
            "pricedesc" => items.OrderByDescending(x => x.CurrentHighBid ?? x.ReservePrice).ThenBy(x => x.AuctionEnd),
            _ => items.OrderBy(x => x.AuctionEnd),
        };
    }

    private static string Fingerprint(SearchQuery query) => string.Join(
        ':',
        CacheKeys.Norm(query.Club),
        CacheKeys.Norm(query.PlayerName),
        CacheKeys.Norm(query.Status),
        CacheKeys.Norm(query.Size),
        CacheKeys.Norm(query.KitType),
        CacheKeys.Norm(query.Condition),
        CacheKeys.Norm(query.Season),
        CacheKeys.Norm(query.League),
        CacheKeys.Norm(query.Sort),
        query.MinPrice?.ToString() ?? "*",
        query.MaxPrice?.ToString() ?? "*",
        query.Page,
        query.PageSize);
}
