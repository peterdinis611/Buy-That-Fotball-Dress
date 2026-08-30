using SettlementService.Common;
using SettlementService.DTOs;

namespace SettlementService.Services;

public interface ISettlementsService
{
    Task<IReadOnlyList<SettlementDto>> GetMineAsync(string username, CancellationToken cancellationToken);
    Task<SettlementDto?> GetByAuctionAsync(Guid auctionId, CancellationToken cancellationToken);
    Task<Result<SettlementDto>> PayAsync(Guid id, string username, CancellationToken cancellationToken);
    Task<Result<SettlementDto>> ShipAsync(Guid id, string username, string? tracking, CancellationToken cancellationToken);
    Task<Result<SettlementDto>> ReceiveAsync(Guid id, string username, CancellationToken cancellationToken);
    Task<Result<SettlementDto>> DisputeAsync(Guid id, string username, string? note, CancellationToken cancellationToken);
}
