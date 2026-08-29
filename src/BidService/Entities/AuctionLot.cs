namespace BidService.Entities;

public class AuctionLot
{
    public Guid Id { get; set; }
    public required string Seller { get; set; }
    public int ReservePrice { get; set; }
    public DateTime AuctionEnd { get; set; }
    public required string Status { get; set; }
    public List<Bid> Bids { get; set; } = [];
}
