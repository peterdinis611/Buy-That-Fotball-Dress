using AuctionService.Common;
using AuctionService.DTOs;
using AuctionService.Entities;

namespace AuctionService.Services;

public interface IAuctionsService
{
    Task<IReadOnlyList<AuctionDto>> GetAllAsync(
        string? club,
        Status? status,
        string? seller,
        CancellationToken cancellationToken);
    Task<Result<AuctionDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<PlayerSheetDto>> GetPlayerSheetAsync(string username, CancellationToken cancellationToken);
    Task<Result<AuctionDto>> CreateAsync(CreateAuctionDto dto, string seller, CancellationToken cancellationToken);
    Task<Result<AuctionDto>> UpdateAsync(Guid id, UpdateAuctionDto dto, string seller, CancellationToken cancellationToken);
    Task<Result> DeleteAsync(Guid id, string seller, CancellationToken cancellationToken);
    Task<Result> ScratchAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<AuctionDto>> VerifyAsync(Guid id, string steward, CancellationToken cancellationToken);
    Task<int> CloseExpiredAsync(CancellationToken cancellationToken);
    Task<Result> WatchAsync(Guid id, string watcher, CancellationToken cancellationToken);
    Task<Result> UnwatchAsync(Guid id, string watcher, CancellationToken cancellationToken);
}
