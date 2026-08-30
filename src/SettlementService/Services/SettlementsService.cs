using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SettlementService.Common;
using SettlementService.Data;
using SettlementService.DTOs;
using SettlementService.Entities;
using SettlementService.Mapping;

namespace SettlementService.Services;

public sealed class SettlementsService(
    SettlementDbContext db,
    IPublishEndpoint publishEndpoint) : ISettlementsService
{
    public async Task<IReadOnlyList<SettlementDto>> GetMineAsync(string username, CancellationToken cancellationToken)
    {
        var name = username.ToLower();
        var rows = await db.Settlements
            .Where(x => x.Buyer.ToLower() == name || x.Seller.ToLower() == name)
            .OrderByDescending(x => x.OpenedAt)
            .ToListAsync(cancellationToken);

        return rows.Select(x => x.ToDto()).ToList();
    }

    public async Task<SettlementDto?> GetByAuctionAsync(Guid auctionId, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.AuctionId == auctionId, cancellationToken);
        return row?.ToDto();
    }

    public async Task<Result<SettlementDto>> PayAsync(Guid id, string username, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (!Same(username, row.Buyer)) return Result<SettlementDto>.Forbidden("Only the buyer can pay.");
        if (row.Status != DeskStatus.Opened) return Result<SettlementDto>.Conflict("This desk is not waiting for payment.");

        row.Status = DeskStatus.Paid;
        row.PaidAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new SettlementPaid { Id = row.Id, AuctionId = row.AuctionId, PaidAt = row.PaidAt.Value }, cancellationToken);
        return Result<SettlementDto>.Success(row.ToDto());
    }

    public async Task<Result<SettlementDto>> ShipAsync(Guid id, string username, string? tracking, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (!Same(username, row.Seller)) return Result<SettlementDto>.Forbidden("Only the seller can ship.");
        if (row.Status != DeskStatus.Paid) return Result<SettlementDto>.Conflict("Pay first, then ship.");

        row.Status = DeskStatus.Shipped;
        row.Tracking = string.IsNullOrWhiteSpace(tracking) ? null : tracking.Trim();
        row.ShippedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new KitShipped
        {
            Id = row.Id,
            AuctionId = row.AuctionId,
            Tracking = row.Tracking,
            ShippedAt = row.ShippedAt.Value
        }, cancellationToken);
        return Result<SettlementDto>.Success(row.ToDto());
    }

    public async Task<Result<SettlementDto>> ReceiveAsync(Guid id, string username, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (!Same(username, row.Buyer)) return Result<SettlementDto>.Forbidden("Only the buyer can confirm receipt.");
        if (row.Status != DeskStatus.Shipped) return Result<SettlementDto>.Conflict("The shirt has not shipped yet.");

        row.Status = DeskStatus.Received;
        row.ReceivedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new SettlementReceived { Id = row.Id, AuctionId = row.AuctionId, ReceivedAt = row.ReceivedAt.Value }, cancellationToken);
        return Result<SettlementDto>.Success(row.ToDto());
    }

    public async Task<Result<SettlementDto>> DisputeAsync(Guid id, string username, string? note, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (!Same(username, row.Buyer) && !Same(username, row.Seller))
            return Result<SettlementDto>.Forbidden("This is not your desk.");
        if (row.Status is DeskStatus.Received or DeskStatus.Disputed)
            return Result<SettlementDto>.Conflict("This desk is already closed.");

        row.Status = DeskStatus.Disputed;
        row.DisputedAt = DateTime.UtcNow;
        row.DisputedBy = username;
        row.DisputeNote = string.IsNullOrWhiteSpace(note) ? null : note.Trim();
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new SettlementDisputed
        {
            Id = row.Id,
            AuctionId = row.AuctionId,
            By = username,
            Note = row.DisputeNote,
            DisputedAt = row.DisputedAt.Value
        }, cancellationToken);
        return Result<SettlementDto>.Success(row.ToDto());
    }

    private static bool Same(string left, string right) =>
        left.Equals(right, StringComparison.OrdinalIgnoreCase);
}
