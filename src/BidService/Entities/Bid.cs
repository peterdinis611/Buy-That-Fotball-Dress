namespace BidService.Entities;

public class Bid
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public AuctionLot Lot { get; set; } = null!;
    public required string Bidder { get; set; }
    public int Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
