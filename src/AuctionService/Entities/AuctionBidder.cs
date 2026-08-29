namespace AuctionService.Entities;

public class AuctionBidder
{
    public Guid AuctionId { get; set; }
    public Auction Auction { get; set; } = null!;
    public required string Bidder { get; set; }
}
