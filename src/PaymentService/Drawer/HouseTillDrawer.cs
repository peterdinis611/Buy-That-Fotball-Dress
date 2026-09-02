using PaymentService.DTOs;
using PaymentService.Entities;

namespace PaymentService.Drawer;

/// <summary>
/// Local card machine — stamps a CARD- slip when Stripe is not configured.
/// Hammer leaves as HAMMER- when the shirt is received.
/// </summary>
public sealed class HouseTillDrawer : ITillDrawer
{
    public Task<TillStamp> CaptureAsync(Till till, ChargeDeskDto? desk, CancellationToken cancellationToken)
    {
        var slip = $"CARD-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(new TillStamp(slip, null));
    }

    public Task<TillStamp> ReleaseAsync(Till till, int hammer, CancellationToken cancellationToken)
    {
        var slip = $"HAMMER-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(new TillStamp(slip, null));
    }

    public CheckoutNotice? ParseWebhook(string json, string signature) => null;
}
