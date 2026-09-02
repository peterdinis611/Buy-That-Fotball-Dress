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
            .OrderByDescending(x => x.ReleasedAt ?? x.CapturedAt ?? x.OpenedAt)
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

        if (row.Status is TillStatus.Captured or TillStatus.Released && !string.IsNullOrWhiteSpace(row.Slip))
            return Result<TillDto>.Success(row.ToDto());

        if (row.Status != TillStatus.Held)
            return Result<TillDto>.Conflict("This till is not waiting for a charge.");

        if (desk is not null && desk.Amount > 0 && desk.Amount != row.Amount)
            return Result<TillDto>.Conflict("The amount on the desk does not match this till.");

        TillStamp stamp;
        try
        {
            stamp = await drawer.CaptureAsync(row, desk, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TillDto>.Conflict(ex.Message);
        }

        if (!string.IsNullOrWhiteSpace(stamp.CheckoutUrl))
        {
            var waiting = row.ToDto();
            waiting.CheckoutUrl = stamp.CheckoutUrl;
            return Result<TillDto>.Success(waiting);
        }

        return await StampCapturedAsync(row, stamp.Slip, cancellationToken);
    }

    public async Task<Result<TillDto>> ApplyWebhookAsync(string json, string signature, CancellationToken cancellationToken)
    {
        CheckoutNotice? notice;
        try
        {
            notice = drawer.ParseWebhook(json, signature);
        }
        catch (Stripe.StripeException ex)
        {
            return Result<TillDto>.Fail(ex.Message, StatusCodes.Status400BadRequest);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TillDto>.Fail(ex.Message, StatusCodes.Status503ServiceUnavailable);
        }

        if (notice is null)
            return Result<TillDto>.Success(new TillDto
            {
                Seller = "",
                Buyer = "",
                Status = TillStatus.Held
            });

        var row = await db.Tills.FirstOrDefaultAsync(x => x.SettlementId == notice.SettlementId, cancellationToken);
        if (row is null)
            return Result<TillDto>.NotFound("No till open for this desk.");

        if (row.Status is TillStatus.Captured or TillStatus.Released && !string.IsNullOrWhiteSpace(row.Slip))
            return Result<TillDto>.Success(row.ToDto());

        if (row.Status != TillStatus.Held)
            return Result<TillDto>.Conflict("This till is not waiting for a charge.");

        return await StampCapturedAsync(row, notice.Slip, cancellationToken);
    }

    public async Task<Result<TillDto>> ReleaseAsync(Guid settlementId, CancellationToken cancellationToken)
    {
        var row = await db.Tills.FirstOrDefaultAsync(x => x.SettlementId == settlementId, cancellationToken);
        if (row is null)
            return Result<TillDto>.NotFound("No till open for this desk.");

        if (row.Status == TillStatus.Released && !string.IsNullOrWhiteSpace(row.PayoutRef))
            return Result<TillDto>.Success(row.ToDto());

        if (row.Status != TillStatus.Captured)
            return Result<TillDto>.Conflict("The house still has no card on this desk.");

        var hammer = row.Hammer > 0 ? row.Hammer : row.Amount;
        TillStamp stamp;
        try
        {
            stamp = await drawer.ReleaseAsync(row, hammer, cancellationToken);
        }
        catch (InvalidOperationException ex)
        {
            return Result<TillDto>.Conflict(ex.Message);
        }

        if (string.IsNullOrWhiteSpace(stamp.Slip))
            return Result<TillDto>.Fail("The till did not pay the hammer.", StatusCodes.Status502BadGateway);

        row.Status = TillStatus.Released;
        row.PayoutRef = stamp.Slip;
        row.ReleasedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        await publishEndpoint.Publish(new PaymentReleased
        {
            Id = row.Id,
            SettlementId = row.SettlementId,
            AuctionId = row.AuctionId,
            Seller = row.Seller,
            Buyer = row.Buyer,
            Hammer = hammer,
            PayoutRef = row.PayoutRef,
            ReleasedAt = row.ReleasedAt.Value
        }, cancellationToken);

        return Result<TillDto>.Success(row.ToDto());
    }

    private async Task<Result<TillDto>> StampCapturedAsync(Till row, string? slip, CancellationToken cancellationToken)
    {
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
