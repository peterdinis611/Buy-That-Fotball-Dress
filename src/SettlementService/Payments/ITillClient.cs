using SettlementService.Common;
using SettlementService.DTOs;
using SettlementService.Entities;

namespace SettlementService.Payments;

public sealed record TillCharge(string? Slip, string? CheckoutUrl);

public interface ITillClient
{
    Task<Result<TillCharge>> ChargeAsync(
        Settlement desk,
        string buyer,
        PayDeskDto? pay,
        CancellationToken cancellationToken);
}
