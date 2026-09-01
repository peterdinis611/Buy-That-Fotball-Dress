using Microsoft.Extensions.Options;
using PaymentService.Entities;
using Stripe;

namespace PaymentService.Drawer;

public sealed class StripeOptions
{
    public string? SecretKey { get; set; }
}

/// <summary>
/// Charges the open till through Stripe and returns the PaymentIntent id as the slip.
/// </summary>
public sealed class StripeTillDrawer(IOptions<StripeOptions> options) : ITillDrawer
{
    public async Task<string> CaptureAsync(Till till, CancellationToken cancellationToken)
    {
        var key = options.Value.SecretKey;
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Stripe:SecretKey is missing.");

        var service = new PaymentIntentService(new StripeClient(key));
        var intent = await service.CreateAsync(
            new PaymentIntentCreateOptions
            {
                Amount = till.Amount * 100L,
                Currency = "eur",
                Confirm = true,
                PaymentMethod = "pm_card_visa",
                Description = $"{till.Club} / {till.PlayerName}",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                    AllowRedirects = "never"
                },
                Metadata = new Dictionary<string, string>
                {
                    ["settlementId"] = till.SettlementId.ToString(),
                    ["auctionId"] = till.AuctionId.ToString(),
                    ["buyer"] = till.Buyer,
                    ["seller"] = till.Seller
                }
            },
            cancellationToken: cancellationToken);

        return intent.Id;
    }
}
