namespace SettlementService.Entities;

public enum DeskStatus
{
    Opened,
    Paid,
    Shipped,
    Received,
    Disputed
}

public class Settlement
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public required string Seller { get; set; }
    public required string Buyer { get; set; }
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public DeskStatus Status { get; set; } = DeskStatus.Opened;
    public string? PaymentRef { get; set; }
    public string? Tracking { get; set; }
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public DateTime? DisputedAt { get; set; }
    public string? DisputedBy { get; set; }
    public string? DisputeNote { get; set; }
}
