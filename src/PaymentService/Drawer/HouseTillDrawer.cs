using PaymentService.Entities;

namespace PaymentService.Drawer;

/// <summary>
/// Local card machine — stamps a CARD- slip when Stripe is not configured.
/// </summary>
public sealed class HouseTillDrawer : ITillDrawer
{
    public Task<string> CaptureAsync(Till till, CancellationToken cancellationToken)
    {
        var slip = $"CARD-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(slip);
    }
}
