using PaymentService.DTOs;
using PaymentService.Entities;

namespace PaymentService.Drawer;

/// <summary>
/// Local card machine — stamps a CARD- slip when Stripe is not configured.
/// </summary>
public sealed class HouseTillDrawer : ITillDrawer
{
    public Task<TillStamp> CaptureAsync(Till till, ChargeDeskDto? desk, CancellationToken cancellationToken)
    {
        var slip = $"CARD-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(new TillStamp(slip, null));
    }
}
