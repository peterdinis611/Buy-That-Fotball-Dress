namespace Contracts;

public class SettlementReceived
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public DateTime ReceivedAt { get; set; }
}
