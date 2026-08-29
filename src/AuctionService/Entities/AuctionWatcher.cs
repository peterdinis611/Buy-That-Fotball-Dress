namespace AuctionService.Entities;

public class AuctionWatcher
{
    public Guid AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;
    public required string Watcher { get; set; }
}
