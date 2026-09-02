using SettlementService.Common;
using SettlementService.DTOs;
using SettlementService.Entities;
using SettlementService.Payments;

namespace KitVault.Tests.Fakes;

public sealed class FakeTillClient : ITillClient
{
    public int StatusCode { get; set; } = 200;
    public string? Error { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? PayoutRef { get; set; }

    public Task<Result<TillCharge>> ChargeAsync(
        Settlement desk,
        string buyer,
        PayDeskDto? pay,
        CancellationToken cancellationToken)
    {
        if (StatusCode != 200)
            return Task.FromResult(Result<TillCharge>.Fail(Error ?? "The till is shut.", StatusCode));

        if (!string.IsNullOrWhiteSpace(CheckoutUrl) && string.IsNullOrWhiteSpace(pay?.SessionId))
            return Task.FromResult(Result<TillCharge>.Success(new TillCharge(null, CheckoutUrl)));

        var slip = $"TILL-{desk.Id.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(Result<TillCharge>.Success(new TillCharge(slip, null)));
    }

    public Task<Result<TillPayout>> ReleaseAsync(Settlement desk, CancellationToken cancellationToken)
    {
        if (StatusCode != 200)
            return Task.FromResult(Result<TillPayout>.Fail(Error ?? "The till is shut.", StatusCode));

        var slip = PayoutRef ?? $"HAMMER-{desk.Id.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(Result<TillPayout>.Success(new TillPayout(slip)));
    }
}
