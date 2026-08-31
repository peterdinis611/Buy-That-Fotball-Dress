using PaymentService.Entities;

namespace PaymentService.Drawer;

/// <summary>
/// House till — stamps a slip locally. Swap this for a card processor later.
/// </summary>
public sealed class HouseTillDrawer : ITillDrawer
{
    public Task<string> CaptureAsync(Till till, CancellationToken cancellationToken)
    {
        var slip = $"TILL-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(slip);
    }
}
