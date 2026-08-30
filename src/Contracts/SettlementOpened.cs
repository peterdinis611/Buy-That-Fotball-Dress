namespace Contracts;

public class SettlementOpened
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string Buyer { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public DateTime OpenedAt { get; set; }
}
