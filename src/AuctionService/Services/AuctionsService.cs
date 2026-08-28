using AuctionService.Common;
using AuctionService.Data;
using AuctionService.DTOs;
using AuctionService.Entities;
using AuctionService.Mapping;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Services;

public sealed class AuctionsService(AuctionDbContext db) : IAuctionsService
{
    public async Task<IReadOnlyList<AuctionDto>> GetAllAsync(
        string? club,
        Status? status,
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

        var auctions = await query
            .OrderBy(x => x.AuctionEnd)
            .ToListAsync(cancellationToken);

        return auctions.Select(x => x.ToDto()).ToList();
    }

    public async Task<Result<AuctionDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var auction = await db.Auctions
            .AsNoTracking()
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return auction is null
            ? Result<AuctionDto>.NotFound($"Auction '{id}' was not found.")
            : Result<AuctionDto>.Success(auction.ToDto());
    }

    public async Task<Result<AuctionDto>> CreateAsync(CreateAuctionDto dto, CancellationToken cancellationToken)
    {
        if (dto.AuctionEnd.ToUniversalTime() <= DateTime.UtcNow)
            return Result<AuctionDto>.BadRequest("Auction end must be in the future.");

        var auction = dto.ToEntity();

        db.Auctions.Add(auction);
        await db.SaveChangesAsync(cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
    }

    public async Task<Result<AuctionDto>> UpdateAsync(
        Guid id,
        UpdateAuctionDto dto,
        CancellationToken cancellationToken)
    {
        var auction = await db.Auctions
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result<AuctionDto>.NotFound($"Auction '{id}' was not found.");

        if (auction.Status is not Status.Live)
            return Result<AuctionDto>.Conflict("Only live auctions can be updated.");

        if (dto.AuctionEnd is not null && dto.AuctionEnd.Value.ToUniversalTime() <= DateTime.UtcNow)
            return Result<AuctionDto>.BadRequest("Auction end must be in the future.");

        auction.ApplyUpdate(dto);
        await db.SaveChangesAsync(cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var auction = await db.Auctions.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result.NotFound($"Auction '{id}' was not found.");

        if (auction.Status is Status.Finished)
            return Result.Conflict("Finished auctions cannot be deleted.");

        db.Auctions.Remove(auction);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
