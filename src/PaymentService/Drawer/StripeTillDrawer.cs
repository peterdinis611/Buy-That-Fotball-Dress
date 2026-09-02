using Microsoft.Extensions.Options;
using PaymentService.DTOs;
using PaymentService.Entities;
using Stripe;
using Stripe.Checkout;

namespace PaymentService.Drawer;

public sealed class StripeOptions
{
    public string? SecretKey { get; set; }
    public string? WebhookSecret { get; set; }
    public string? PublicApp { get; set; }
    public Dictionary<string, string> ConnectAccounts { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

/// <summary>
/// Hosted Stripe Checkout — due lands at the house. Hammer transfers on receive when Connect is set.
/// </summary>
public sealed class StripeTillDrawer(IOptions<StripeOptions> options) : ITillDrawer
{
    public async Task<TillStamp> CaptureAsync(Till till, ChargeDeskDto? desk, CancellationToken cancellationToken)
    {
        var key = RequireKey();
        var client = new StripeClient(key);
        var sessions = new SessionService(client);

        if (!string.IsNullOrWhiteSpace(desk?.SessionId))
            return await FromSessionAsync(sessions, desk.SessionId, cancellationToken);

        var app = string.IsNullOrWhiteSpace(options.Value.PublicApp)
            ? "http://localhost:3000"
            : options.Value.PublicApp.TrimEnd('/');
        var success = string.IsNullOrWhiteSpace(desk?.SuccessUrl)
            ? $"{app}/profile?desk={till.SettlementId:D}&session_id={{CHECKOUT_SESSION_ID}}"
            : desk.SuccessUrl;
        var cancel = string.IsNullOrWhiteSpace(desk?.CancelUrl)
            ? $"{app}/profile?desk={till.SettlementId:D}"
            : desk.CancelUrl;

        var hammer = till.Hammer > 0 ? till.Hammer : till.Amount;
        var session = await sessions.CreateAsync(
            new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = success,
                CancelUrl = cancel,
                PaymentIntentData = new SessionPaymentIntentDataOptions
                {
                    CaptureMethod = "automatic",
                    TransferGroup = till.SettlementId.ToString("D"),
                    Description = $"{till.Club} / {till.PlayerName}",
                    Metadata = Meta(till, hammer)
                },
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
                Metadata = Meta(till, hammer)
            },
            cancellationToken: cancellationToken);

        return new TillStamp(null, session.Url);
    }

    public async Task<TillStamp> ReleaseAsync(Till till, int hammer, CancellationToken cancellationToken)
    {
        var key = RequireKey();
        if (hammer <= 0)
            return new TillStamp($"HAMMER-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}", null);

        if (!options.Value.ConnectAccounts.TryGetValue(till.Seller, out var dest) || string.IsNullOrWhiteSpace(dest))
            return new TillStamp($"HAMMER-{till.SettlementId.ToString("N")[..8].ToUpperInvariant()}", null);

        var transfers = new TransferService(new StripeClient(key));
        var transfer = await transfers.CreateAsync(
            new TransferCreateOptions
            {
                Amount = hammer * 100L,
                Currency = "eur",
                Destination = dest,
                TransferGroup = till.SettlementId.ToString("D"),
                Description = $"Hammer · {till.Club} / {till.PlayerName}",
                Metadata = Meta(till, hammer)
            },
            cancellationToken: cancellationToken);

        return new TillStamp(transfer.Id, null);
    }

    public CheckoutNotice? ParseWebhook(string json, string signature)
    {
        var secret = options.Value.WebhookSecret;
        if (string.IsNullOrWhiteSpace(secret))
            throw new InvalidOperationException("Stripe:WebhookSecret is missing.");

        var stripeEvent = EventUtility.ConstructEvent(json, signature, secret, throwOnApiVersionMismatch: false);
        if (!string.Equals(stripeEvent.Type, EventTypes.CheckoutSessionCompleted, StringComparison.OrdinalIgnoreCase)
            && stripeEvent.Type != "checkout.session.completed")
            return null;

        if (stripeEvent.Data.Object is not Session session)
            return null;
        if (!string.Equals(session.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
            return null;
        if (session.Metadata is null
            || !session.Metadata.TryGetValue("settlementId", out var raw)
            || !Guid.TryParse(raw, out var settlementId))
            return null;

        var slip = string.IsNullOrWhiteSpace(session.PaymentIntentId) ? session.Id : session.PaymentIntentId;
        return new CheckoutNotice(settlementId, slip);
    }

    private async Task<TillStamp> FromSessionAsync(SessionService sessions, string sessionId, CancellationToken cancellationToken)
    {
        var paid = await sessions.GetAsync(sessionId, cancellationToken: cancellationToken);
        if (!string.Equals(paid.PaymentStatus, "paid", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Card desk is still open.");

        var slip = string.IsNullOrWhiteSpace(paid.PaymentIntentId) ? paid.Id : paid.PaymentIntentId;
        return new TillStamp(slip, null);
    }

    private string RequireKey()
    {
        var key = options.Value.SecretKey;
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Stripe:SecretKey is missing.");
        return key;
    }

    private static Dictionary<string, string> Meta(Till till, int hammer) => new()
    {
        ["settlementId"] = till.SettlementId.ToString(),
        ["auctionId"] = till.AuctionId.ToString(),
        ["buyer"] = till.Buyer,
        ["seller"] = till.Seller,
        ["hammer"] = hammer.ToString()
    };
}
