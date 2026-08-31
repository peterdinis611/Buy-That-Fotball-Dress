namespace PaymentService.Entities;

public enum TillStatus
{
    Held,
    Captured,
    Voided
}

public class Till
{
    public Guid Id { get; set; }
    public Guid SettlementId { get; set; }
    public Guid AuctionId { get; set; }
    public required string Seller { get; set; }
    public required string Buyer { get; set; }
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public TillStatus Status { get; set; } = TillStatus.Held;
    public string? Slip { get; set; }
    public DateTime OpenedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CapturedAt { get; set; }
}
