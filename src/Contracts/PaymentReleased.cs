namespace Contracts;

public class PaymentReleased
{
    public Guid Id { get; set; }
    public Guid SettlementId { get; set; }
    public Guid AuctionId { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string Buyer { get; set; } = string.Empty;
    public int Hammer { get; set; }
    public string PayoutRef { get; set; } = string.Empty;
    public DateTime ReleasedAt { get; set; }
}
