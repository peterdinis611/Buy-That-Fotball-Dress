using Microsoft.EntityFrameworkCore;
using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Data;

public sealed class ItemRepository(SearchDbContext db) : IItemRepository
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
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var item = await db.Items.FindAsync([id], cancellationToken);
        if (item is null)
            return;

        db.Items.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<Item>> SearchAsync(SearchQuery query, CancellationToken cancellationToken)
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

        if (query.MinPrice is not null)
            items = items.Where(x => x.ReservePrice >= query.MinPrice);

        if (query.MaxPrice is not null)
            items = items.Where(x => x.ReservePrice <= query.MaxPrice);

        var totalCount = await items.LongCountAsync(cancellationToken);

        var results = await items
            .OrderBy(x => x.AuctionEnd)
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

    public Task<long> CountAsync(CancellationToken cancellationToken) =>
        db.Items.LongCountAsync(cancellationToken);
}
