using PaymentService.DTOs;
using PaymentService.Entities;

namespace PaymentService.Drawer;

public sealed record CheckoutNotice(Guid SettlementId, string Slip);

public interface ITillDrawer
{
    Task<TillStamp> CaptureAsync(Till till, ChargeDeskDto? desk, CancellationToken cancellationToken);
    Task<TillStamp> ReleaseAsync(Till till, int hammer, CancellationToken cancellationToken);
    CheckoutNotice? ParseWebhook(string json, string signature);
}
