namespace BidService.DTOs;

public class AuctionSyncDto
{
    public Guid Id { get; set; }
    public int ReservePrice { get; set; }
    public string Seller { get; set; } = string.Empty;
    public DateTime AuctionEnd { get; set; }
    public string Status { get; set; } = string.Empty;
}
