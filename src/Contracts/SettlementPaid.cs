namespace Contracts;

public class SettlementPaid
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public DateTime PaidAt { get; set; }
}
