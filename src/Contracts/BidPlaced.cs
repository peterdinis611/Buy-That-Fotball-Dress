namespace Contracts;

public class BidPlaced
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public string Bidder { get; set; } = string.Empty;
    public string? PreviousBidder { get; set; }
    public int Amount { get; set; }
    public DateTime CreatedAt { get; set; }
}
