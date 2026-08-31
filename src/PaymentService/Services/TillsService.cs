using Contracts;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using PaymentService.Common;
using PaymentService.Data;
using PaymentService.Drawer;
using PaymentService.DTOs;
using PaymentService.Entities;
using PaymentService.Mapping;

namespace PaymentService.Services;

public sealed class TillsService(
    PaymentDbContext db,
    ITillDrawer drawer,
    IPublishEndpoint publishEndpoint) : ITillsService
{
    public async Task<IReadOnlyList<TillDto>> GetMineAsync(string username, CancellationToken cancellationToken)
    {
        var name = username.ToLower();
        var rows = await db.Tills
            .Where(x => x.Buyer.ToLower() == name || x.Seller.ToLower() == name)
            .OrderByDescending(x => x.OpenedAt)
            .ToListAsync(cancellationToken);

        return rows.Select(x => x.ToDto()).ToList();
    }

    public async Task<IReadOnlyList<TillDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var rows = await db.Tills
            .OrderByDescending(x => x.CapturedAt ?? x.OpenedAt)
            .ToListAsync(cancellationToken);

        return rows.Select(x => x.ToDto()).ToList();
    }

    public async Task<TillDto?> GetBySettlementAsync(Guid settlementId, CancellationToken cancellationToken)
    {
        var row = await db.Tills.FirstOrDefaultAsync(x => x.SettlementId == settlementId, cancellationToken);
        return row?.ToDto();
    }

    public async Task<Result<TillDto>> ChargeAsync(
        Guid settlementId,
        string username,
        ChargeDeskDto? desk,
        CancellationToken cancellationToken)
    {
        var row = await db.Tills.FirstOrDefaultAsync(x => x.SettlementId == settlementId, cancellationToken);
        if (row is null)
            return Result<TillDto>.NotFound("No till open for this desk.");

        if (!Same(username, row.Buyer))
            return Result<TillDto>.Forbidden("Only the buyer can pay at this till.");

        if (row.Status == TillStatus.Captured && !string.IsNullOrWhiteSpace(row.Slip))
            return Result<TillDto>.Success(row.ToDto());

        if (row.Status != TillStatus.Held)
            return Result<TillDto>.Conflict("This till is not waiting for a charge.");

        if (desk is not null && desk.Amount > 0 && desk.Amount != row.Amount)
            return Result<TillDto>.Conflict("The amount on the desk does not match this till.");

        var slip = await drawer.CaptureAsync(row, cancellationToken);
        if (string.IsNullOrWhiteSpace(slip))
            return Result<TillDto>.Fail("The till did not stamp a slip.", StatusCodes.Status502BadGateway);

        row.Status = TillStatus.Captured;
        row.Slip = slip;
        row.CapturedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        await publishEndpoint.Publish(new PaymentCaptured
        {
            Id = row.Id,
            SettlementId = row.SettlementId,
            AuctionId = row.AuctionId,
            Seller = row.Seller,
            Buyer = row.Buyer,
            Amount = row.Amount,
            Club = row.Club,
            PlayerName = row.PlayerName,
            Slip = row.Slip,
            CapturedAt = row.CapturedAt.Value
        }, cancellationToken);

        return Result<TillDto>.Success(row.ToDto());
    }

    private static bool Same(string left, string right) =>
        left.Equals(right, StringComparison.OrdinalIgnoreCase);
}
