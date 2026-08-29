using BidService.Common;
using BidService.DTOs;

namespace BidService.Services;

public interface IBidsService
{
    Task<IReadOnlyList<BidDto>> GetForAuctionAsync(Guid auctionId, CancellationToken cancellationToken);
    Task<Result<BidDto>> PlaceAsync(Guid auctionId, string bidder, int amount, CancellationToken cancellationToken);
}
