using PaymentService.Common;
using PaymentService.DTOs;

namespace PaymentService.Services;

public interface ITillsService
{
    Task<IReadOnlyList<TillDto>> GetMineAsync(string username, CancellationToken cancellationToken);
    Task<IReadOnlyList<TillDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<TillDto?> GetBySettlementAsync(Guid settlementId, CancellationToken cancellationToken);
    Task<Result<TillDto>> ChargeAsync(Guid settlementId, string username, ChargeDeskDto? desk, CancellationToken cancellationToken);
}
