namespace Contracts;

public class KitShipped
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public string? Tracking { get; set; }
    public DateTime ShippedAt { get; set; }
}
