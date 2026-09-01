namespace BidService.DTOs;

public class BidDto
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public string Bidder { get; set; } = string.Empty;
    public int Amount { get; set; }
    public int? MaxAmount { get; set; }
    public bool Snag { get; set; }
    public DateTime CreatedAt { get; set; }
}
