namespace Contracts;

public class EscrowReleaseRequested
{
    public Guid SettlementId { get; set; }
    public Guid AuctionId { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string Buyer { get; set; } = string.Empty;
    public int Hammer { get; set; }
}
