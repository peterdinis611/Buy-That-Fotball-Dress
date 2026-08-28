using AuctionService.Common;
using AuctionService.Data;
using AuctionService.DTOs;
using AuctionService.Entities;
using AuctionService.Mapping;
using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;

namespace AuctionService.Services;

public sealed class AuctionsService(AuctionDbContext db, IPublishEndpoint publishEndpoint) : IAuctionsService
{
    public async Task<IReadOnlyList<AuctionDto>> GetAllAsync(
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

    public async Task<Result<PlayerSheetDto>> GetPlayerSheetAsync(
        string username,
        CancellationToken cancellationToken)
    {
        var name = username.Trim().ToLower();

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

        var chasingIds = await db.Bids
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

        return Result<PlayerSheetDto>.Success(new PlayerSheetDto
        {
            Listed = listed.Select(x => x.ToDto()).ToList(),
            Chasing = chasing.Select(x => x.ToDto()).ToList(),
            Won = won.Select(x => x.ToDto()).ToList()
        });
    }

    public async Task<Result<AuctionDto>> PlaceBidAsync(
        Guid id,
        string bidder,
        int amount,
        CancellationToken cancellationToken)
    {
        if (amount <= 0)
            return Result<AuctionDto>.BadRequest("A shot has to be more than nothing.");

        var auction = await db.Auctions
            .Include(x => x.Item)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (auction is null)
            return Result<AuctionDto>.NotFound($"Auction '{id}' was not found.");

        if (string.Equals(auction.Seller, bidder, StringComparison.OrdinalIgnoreCase))
            return Result<AuctionDto>.Forbidden("You cannot shoot at your own shirt.");

        if (auction.Status is not Status.Live || auction.AuctionEnd.ToUniversalTime() <= DateTime.UtcNow)
            return Result<AuctionDto>.Conflict("This lot is no longer on the pitch.");

        var floor = auction.CurrentHighBid is int high && high > 0
            ? high + 1
            : auction.ReservePrice;

        if (amount < floor)
            return Result<AuctionDto>.BadRequest($"The next shot must be at least {floor}.");

        db.Bids.Add(new Bid
        {
            Id = Guid.NewGuid(),
            AuctionId = auction.Id,
            Bidder = bidder,
            Amount = amount,
            CreatedAt = DateTime.UtcNow
        });
        auction.CurrentHighBid = amount;
        auction.HighBidder = bidder;
        auction.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(auction.ToAuctionUpdated(), cancellationToken);

        return Result<AuctionDto>.Success(auction.ToDto());
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

        db.Auctions.Remove(auction);
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new AuctionDeleted { Id = id }, cancellationToken);

        return Result.Success();
    }
}
