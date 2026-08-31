using SettlementService.Common;
using SettlementService.Entities;

namespace SettlementService.Payments;

public interface ITillClient
{
    Task<Result<string>> ChargeAsync(Settlement desk, string buyer, CancellationToken cancellationToken);
}
