using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SettlementService.Common;
using SettlementService.Data;
using SettlementService.DTOs;
using SettlementService.Entities;
using SettlementService.Mapping;
using SettlementService.Payments;

namespace SettlementService.Services;

public sealed class SettlementsService(
    SettlementDbContext db,
    IPublishEndpoint publishEndpoint,
    ITillClient till) : ISettlementsService
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

    public async Task<IReadOnlyList<SettlementDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var rows = await db.Settlements
            .OrderByDescending(x => x.DisputedAt ?? x.OpenedAt)
            .ToListAsync(cancellationToken);

        return rows.Select(x => x.ToDto()).ToList();
    }

    public async Task<SettlementDto?> GetByAuctionAsync(Guid auctionId, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.AuctionId == auctionId, cancellationToken);
        return row?.ToDto();
    }

    public async Task<Result<SettlementDto>> PayAsync(
        Guid id,
        string username,
        CancellationToken cancellationToken,
        PayDeskDto? pay = null)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (!Same(username, row.Buyer)) return Result<SettlementDto>.Forbidden("Only the buyer can pay.");
        if (row.Status != DeskStatus.Opened) return Result<SettlementDto>.Conflict("This desk is not waiting for payment.");

        var charge = await till.ChargeAsync(row, username, pay, cancellationToken);
        if (!charge.IsSuccess)
            return Result<SettlementDto>.Fail(charge.Error ?? "The till refused that charge.", charge.StatusCode);

        if (!string.IsNullOrWhiteSpace(charge.Value?.CheckoutUrl))
        {
            var waiting = row.ToDto();
            waiting.CheckoutUrl = charge.Value.CheckoutUrl;
            return Result<SettlementDto>.Success(waiting);
        }

        var slip = charge.Value?.Slip;
        if (string.IsNullOrWhiteSpace(slip))
            return Result<SettlementDto>.Fail("The till did not stamp a slip.", StatusCodes.Status502BadGateway);

        row.Status = DeskStatus.Paid;
        row.PaidAt = DateTime.UtcNow;
        row.PaymentRef = slip;
        await db.SaveChangesAsync(cancellationToken);
        var hammer = row.Hammer > 0 ? row.Hammer : row.Amount;
        await publishEndpoint.Publish(new SettlementPaid
        {
            Id = row.Id,
            AuctionId = row.AuctionId,
            Seller = row.Seller,
            Buyer = row.Buyer,
            Amount = row.Amount,
            Hammer = hammer,
            Club = row.Club,
            PlayerName = row.PlayerName,
            PaymentRef = row.PaymentRef,
            PaidAt = row.PaidAt.Value
        }, cancellationToken);
        return Result<SettlementDto>.Success(row.ToDto());
    }

    public async Task<Result<SettlementDto>> ShipAsync(Guid id, string username, string? tracking, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (!Same(username, row.Seller)) return Result<SettlementDto>.Forbidden("Only the seller can ship.");
        if (row.Status != DeskStatus.Paid) return Result<SettlementDto>.Conflict("Pay first, then ship.");

        var slip = tracking?.Trim() ?? "";
        if (slip.Length < 4 || slip.Length > 80)
            return Result<SettlementDto>.BadRequest("Add a tracking number (at least 4 characters).");

        row.Status = DeskStatus.Shipped;
        row.Tracking = slip;
        row.ShippedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        await publishEndpoint.Publish(new KitShipped
        {
            Id = row.Id,
            AuctionId = row.AuctionId,
            Seller = row.Seller,
            Buyer = row.Buyer,
            Amount = row.Amount,
            Club = row.Club,
            PlayerName = row.PlayerName,
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

        var reason = note?.Trim() ?? "";
        if (reason.Length < 8 || reason.Length > 400)
            return Result<SettlementDto>.BadRequest("Say why you are raising a dispute (at least 8 characters).");

        row.Status = DeskStatus.Disputed;
        row.DisputedAt = DateTime.UtcNow;
        row.DisputedBy = username;
        row.DisputeNote = reason;
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

    public async Task<Result<SettlementDto>> WhistleAsync(Guid id, CancellationToken cancellationToken)
    {
        var row = await db.Settlements.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (row is null) return Result<SettlementDto>.NotFound("Desk not found.");
        if (row.Status != DeskStatus.Disputed)
            return Result<SettlementDto>.Conflict("The whistle is for disputed desks.");

        row.Status = row.ShippedAt is not null
            ? DeskStatus.Shipped
            : row.PaidAt is not null
                ? DeskStatus.Paid
                : DeskStatus.Opened;
        row.DisputedAt = null;
        row.DisputedBy = null;
        row.DisputeNote = null;
        await db.SaveChangesAsync(cancellationToken);
        return Result<SettlementDto>.Success(row.ToDto());
    }

    private static bool Same(string left, string right) =>
        left.Equals(right, StringComparison.OrdinalIgnoreCase);
}
