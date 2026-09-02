using AuctionService.Common;
using AuctionService.Data;
using AuctionService.DTOs;
using AuctionService.Entities;
using AuctionService.Mapping;
using Caching;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Services;

public sealed class AuctionsService(
    AuctionDbContext db,
    IPublishEndpoint publishEndpoint,
    IPitchCache cache) : IAuctionsService
{
    public async Task<IReadOnlyList<AuctionDto>> GetAllAsync(
        string? club,
        Status? status,
        string? seller,
        CancellationToken cancellationToken)
    {
        var stamp = await cache.StampAsync(CacheStamps.Auctions, cancellationToken);
        return await cache.GetOrCreateAsync<List<AuctionDto>>(
            CacheKeys.AuctionList(stamp, club, status?.ToString(), seller),
            cancel => LoadAllAsync(club, status, seller, cancel),
            CacheKeys.CatalogTtl,
            cancellationToken);
    }

    public async Task<Result<AuctionDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var key = CacheKeys.Auction(id);
        var cached = await cache.GetAsync<AuctionDto>(key, cancellationToken);
        if (cached is not null)
            return Result<AuctionDto>.Success(cached);

        var auction = await db.Auctions
            .AsNoTracking()
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result<AuctionDto>.NotFound($"Auction '{id}' was not found.");

        var dto = auction.ToDto();
        await cache.SetAsync(key, dto, CacheKeys.CatalogTtl, cancellationToken);
        return Result<AuctionDto>.Success(dto);
    }

    public async Task<Result<PlayerSheetDto>> GetPlayerSheetAsync(
        string username,
        CancellationToken cancellationToken)
    {
        var name = username.Trim().ToLower();
        var stamp = await cache.StampAsync(CacheStamps.Sheets, cancellationToken);
        var sheet = await cache.GetOrCreateAsync(
            CacheKeys.Sheet(stamp, name),
            cancel => LoadSheetAsync(name, cancel),
            CacheKeys.SheetTtl,
            cancellationToken);

        return Result<PlayerSheetDto>.Success(sheet);
    }

    public async Task<Result<AuctionDto>> CreateAsync(
        CreateAuctionDto dto,
        string seller,
        CancellationToken cancellationToken)
    {
        if (dto.AuctionEnd.ToUniversalTime() <= DateTime.UtcNow)
            return Result<AuctionDto>.BadRequest("Auction end must be in the future.");

        dto.Seller = seller;
        var auction = dto.ToEntity();

        db.Auctions.Add(auction);
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(auction.ToAuctionCreated(), cancellationToken);
        await InvalidateLotAsync(auction.Id, cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
    }

    public async Task<Result<AuctionDto>> UpdateAsync(
        Guid id,
        UpdateAuctionDto dto,
        string seller,
        CancellationToken cancellationToken)
    {
        var auction = await db.Auctions
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result<AuctionDto>.NotFound($"Auction '{id}' was not found.");

        if (!string.Equals(auction.Seller, seller, StringComparison.OrdinalIgnoreCase))
            return Result<AuctionDto>.Forbidden("Only the seller can update this lot.");

        if (auction.Status is not Status.Live)
            return Result<AuctionDto>.Conflict("Only live auctions can be updated.");

        if (dto.AuctionEnd is not null && dto.AuctionEnd.Value.ToUniversalTime() <= DateTime.UtcNow)
            return Result<AuctionDto>.BadRequest("Auction end must be in the future.");

        auction.ApplyUpdate(dto);
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(auction.ToAuctionUpdated(), cancellationToken);
        await InvalidateLotAsync(auction.Id, cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
    }

    public async Task<Result<AuctionDto>> RelistAsync(
        Guid id,
        DateTime auctionEnd,
        string seller,
        CancellationToken cancellationToken)
    {
        var auction = await db.Auctions
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result<AuctionDto>.NotFound($"Auction '{id}' was not found.");

        if (!string.Equals(auction.Seller, seller, StringComparison.OrdinalIgnoreCase))
            return Result<AuctionDto>.Forbidden("Only the seller can hang this shirt again.");

        if (auction.Status is not Status.ReserveNotMet)
            return Result<AuctionDto>.Conflict("Only unsold lots can hang again.");

        if (auctionEnd.ToUniversalTime() <= DateTime.UtcNow)
            return Result<AuctionDto>.BadRequest("Auction end must be in the future.");

        auction.Status = Status.Live;
        auction.AuctionEnd = auctionEnd.ToUniversalTime();
        auction.Injury = false;
        auction.CurrentHighBid = null;
        auction.HighBidder = null;
        auction.Winner = null;
        auction.SoldAmount = null;
        auction.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(auction.ToAuctionUpdated(), cancellationToken);
        await InvalidateLotAsync(auction.Id, cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
    }

    public async Task<Result> DeleteAsync(Guid id, string seller, CancellationToken cancellationToken)
    {
        var auction = await db.Auctions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result.NotFound($"Auction '{id}' was not found.");

        if (!string.Equals(auction.Seller, seller, StringComparison.OrdinalIgnoreCase))
            return Result.Forbidden("Only the seller can take this shirt down.");

        if (auction.Status is Status.Finished)
            return Result.Conflict("Finished auctions cannot be deleted.");

        return await PullLotAsync(auction, cancellationToken);
    }

    public async Task<Result> ScratchAsync(Guid id, CancellationToken cancellationToken)
    {
        var auction = await db.Auctions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result.NotFound($"Auction '{id}' was not found.");

        if (auction.Status is Status.Finished)
            return Result.Conflict("Sold lots stay on the desk. The steward cannot scratch them.");

        return await PullLotAsync(auction, cancellationToken);
    }

    public async Task<Result<AuctionDto>> VerifyAsync(Guid id, string steward, CancellationToken cancellationToken)
    {
        var auction = await db.Auctions
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result<AuctionDto>.NotFound($"Auction '{id}' was not found.");

        auction.Item.VerifiedBy = steward.Trim();
        auction.Item.VerifiedAt = DateTime.UtcNow;
        auction.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(auction.ToAuctionUpdated(), cancellationToken);
        await InvalidateLotAsync(id, cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
    }

    private async Task<Result> PullLotAsync(Auction auction, CancellationToken cancellationToken)
    {
        var id = auction.Id;
        db.Auctions.Remove(auction);
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new AuctionDeleted { Id = id }, cancellationToken);
        await InvalidateLotAsync(id, cancellationToken);

        return Result.Success();
    }

    public async Task<Result> WatchAsync(Guid id, string watcher, CancellationToken cancellationToken)
    {
        var auction = await db.Auctions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (auction is null)
            return Result.NotFound($"Auction '{id}' was not found.");

        if (string.Equals(auction.Seller, watcher, StringComparison.OrdinalIgnoreCase))
            return Result.Forbidden("You cannot watch your own listing.");

        if (auction.Status is not Status.Live)
            return Result.Conflict("Only live lots can be watched.");

        var name = watcher.Trim();
        var already = await db.AuctionWatchers.AnyAsync(
            x => x.AuctionId == id && x.Watcher.ToLower() == name.ToLower(),
            cancellationToken);

        if (!already)
        {
            db.AuctionWatchers.Add(new AuctionWatcher { AuctionId = id, Watcher = name });
            await db.SaveChangesAsync(cancellationToken);
            await cache.BumpAsync(CacheStamps.Sheets, cancellationToken);
        }

        return Result.Success();
    }

    public async Task<Result> UnwatchAsync(Guid id, string watcher, CancellationToken cancellationToken)
    {
        var name = watcher.Trim().ToLower();
        var row = await db.AuctionWatchers.FirstOrDefaultAsync(
            x => x.AuctionId == id && x.Watcher.ToLower() == name,
            cancellationToken);

        if (row is not null)
        {
            db.AuctionWatchers.Remove(row);
            await db.SaveChangesAsync(cancellationToken);
            await cache.BumpAsync(CacheStamps.Sheets, cancellationToken);
        }

        return Result.Success();
    }

    public async Task<int> CloseExpiredAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var expired = await db.Auctions
            .Include(x => x.Item)
            .Where(x => x.Status == Status.Live && x.AuctionEnd <= now)
            .ToListAsync(cancellationToken);

        foreach (var auction in expired)
        {
            CloseLot(auction, now);
            await db.SaveChangesAsync(cancellationToken);
            await publishEndpoint.Publish(auction.ToAuctionUpdated(), cancellationToken);
            await cache.RemoveAsync(CacheKeys.Auction(auction.Id), cancellationToken);
        }

        if (expired.Count > 0)
        {
            await cache.BumpAsync(CacheStamps.Auctions, cancellationToken);
            await cache.BumpAsync(CacheStamps.Sheets, cancellationToken);
        }

        return expired.Count;
    }

    private static void CloseLot(Auction auction, DateTime now)
    {
        auction.UpdatedAt = now;

        if (auction.CurrentHighBid is int high
            && high >= auction.ReservePrice
            && !string.IsNullOrWhiteSpace(auction.HighBidder))
        {
            auction.Status = Status.Finished;
            auction.Winner = auction.HighBidder;
            auction.SoldAmount = high;
            return;
        }

        auction.Status = Status.ReserveNotMet;
        auction.Winner = null;
        auction.SoldAmount = null;
    }

    private async Task<List<AuctionDto>> LoadAllAsync(
        string? club,
        Status? status,
        string? seller,
        CancellationToken cancellationToken)
    {
        var query = db.Auctions
            .AsNoTracking()
            .Include(x => x.Item)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(club))
        {
            var clubFilter = club.Trim().ToLower();
            query = query.Where(x => x.Item.Club.ToLower().Contains(clubFilter));
        }

        if (status is not null)
            query = query.Where(x => x.Status == status);

        if (!string.IsNullOrWhiteSpace(seller))
        {
            var sellerFilter = seller.Trim().ToLower();
            query = query.Where(x => x.Seller.ToLower() == sellerFilter);
        }

        var auctions = await query
            .OrderBy(x => x.AuctionEnd)
            .ToListAsync(cancellationToken);

        return auctions.Select(x => x.ToDto()).ToList();
    }

    private async Task<PlayerSheetDto> LoadSheetAsync(string name, CancellationToken cancellationToken)
    {
        var listed = await db.Auctions
            .AsNoTracking()
            .Include(x => x.Item)
            .Where(x => x.Seller.ToLower() == name)
            .OrderBy(x => x.AuctionEnd)
            .ToListAsync(cancellationToken);

        var won = await db.Auctions
            .AsNoTracking()
            .Include(x => x.Item)
            .Where(x => x.Winner != null && x.Winner.ToLower() == name)
            .OrderByDescending(x => x.AuctionEnd)
            .ToListAsync(cancellationToken);

        var chasingIds = await db.AuctionBidders
            .AsNoTracking()
            .Where(x => x.Bidder.ToLower() == name)
            .Select(x => x.AuctionId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var wonIds = won.Select(x => x.Id).ToHashSet();
        var listedIds = listed.Select(x => x.Id).ToHashSet();

        var chasing = chasingIds.Count == 0
            ? []
            : await db.Auctions
                .AsNoTracking()
                .Include(x => x.Item)
                .Where(x => chasingIds.Contains(x.Id) && !wonIds.Contains(x.Id) && !listedIds.Contains(x.Id))
                .OrderBy(x => x.AuctionEnd)
                .ToListAsync(cancellationToken);

        var watchingIds = await db.AuctionWatchers
            .AsNoTracking()
            .Where(x => x.Watcher.ToLower() == name)
            .Select(x => x.AuctionId)
            .Distinct()
            .ToListAsync(cancellationToken);

        var chasingIdSet = chasingIds.ToHashSet();

        var watching = watchingIds.Count == 0
            ? []
            : await db.Auctions
                .AsNoTracking()
                .Include(x => x.Item)
                .Where(x => watchingIds.Contains(x.Id)
                    && !wonIds.Contains(x.Id)
                    && !listedIds.Contains(x.Id)
                    && !chasingIdSet.Contains(x.Id))
                .OrderBy(x => x.AuctionEnd)
                .ToListAsync(cancellationToken);

        return new PlayerSheetDto
        {
            Listed = listed.Select(x => x.ToDto()).ToList(),
            Chasing = chasing.Select(x => x.ToDto()).ToList(),
            Won = won.Select(x => x.ToDto()).ToList(),
            Watching = watching.Select(x => x.ToDto()).ToList()
        };
    }

    private async Task InvalidateLotAsync(Guid id, CancellationToken cancellationToken)
    {
        await cache.RemoveAsync(CacheKeys.Auction(id), cancellationToken);
        await cache.BumpAsync(CacheStamps.Auctions, cancellationToken);
        await cache.BumpAsync(CacheStamps.Sheets, cancellationToken);
    }
}
