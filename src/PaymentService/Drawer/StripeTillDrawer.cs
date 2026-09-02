using Microsoft.Extensions.Options;
using PaymentService.DTOs;
using PaymentService.Entities;
using Stripe;
using Stripe.Checkout;

namespace PaymentService.Drawer;

public sealed class StripeOptions
{
    public string? SecretKey { get; set; }
    public string? PublicApp { get; set; }
}

/// <summary>
/// Hosted Stripe Checkout — the buyer pays in the browser, not with a test PM on the backend.
/// </summary>
public sealed class StripeTillDrawer(IOptions<StripeOptions> options) : ITillDrawer
{
    public async Task<TillStamp> CaptureAsync(Till till, ChargeDeskDto? desk, CancellationToken cancellationToken)
    {
        var key = options.Value.SecretKey;
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Stripe:SecretKey is missing.");

        var client = new StripeClient(key);
        var sessions = new SessionService(client);

        if (!string.IsNullOrWhiteSpace(desk?.SessionId))
        {
            var paid = await sessions.GetAsync(desk.SessionId, cancellationToken: cancellationToken);
            if (!string.Equals(paid.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Card desk is still open.");

            var slip = string.IsNullOrWhiteSpace(paid.PaymentIntentId) ? paid.Id : paid.PaymentIntentId;
            return new TillStamp(slip, null);
        }

        var app = string.IsNullOrWhiteSpace(options.Value.PublicApp)
            ? "http://localhost:3000"
            : options.Value.PublicApp.TrimEnd('/');
        var success = string.IsNullOrWhiteSpace(desk?.SuccessUrl)
            ? $"{app}/profile?desk={till.SettlementId:D}&session_id={{CHECKOUT_SESSION_ID}}"
            : desk.SuccessUrl;
        var cancel = string.IsNullOrWhiteSpace(desk?.CancelUrl)
            ? $"{app}/profile?desk={till.SettlementId:D}"
            : desk.CancelUrl;

        var session = await sessions.CreateAsync(
            new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = success,
                CancelUrl = cancel,
                LineItems =
                [
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = "eur",
                            UnitAmount = till.Amount * 100L,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"{till.Club} / {till.PlayerName}"
                            }
                        }
                    }
                ],
                Metadata = new Dictionary<string, string>
                {
                    ["settlementId"] = till.SettlementId.ToString(),
                    ["auctionId"] = till.AuctionId.ToString(),
                    ["buyer"] = till.Buyer,
                    ["seller"] = till.Seller
                }
            },
            cancellationToken: cancellationToken);

        return new TillStamp(null, session.Url);
    }
}
