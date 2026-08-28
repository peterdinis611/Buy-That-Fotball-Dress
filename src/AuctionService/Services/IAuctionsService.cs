using AuctionService.Common;
using AuctionService.DTOs;
using AuctionService.Entities;

namespace AuctionService.Services;

public interface IAuctionsService
{
    Task<IReadOnlyList<AuctionDto>> GetAllAsync(string? club, Status? status, CancellationToken cancellationToken);
    Task<Result<AuctionDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Result<AuctionDto>> CreateAsync(CreateAuctionDto dto, CancellationToken cancellationToken);
    Task<Result<AuctionDto>> UpdateAsync(Guid id, UpdateAuctionDto dto, CancellationToken cancellationToken);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
