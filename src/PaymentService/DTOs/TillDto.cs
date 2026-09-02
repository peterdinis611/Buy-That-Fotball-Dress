using PaymentService.Entities;

namespace PaymentService.DTOs;

public class TillDto
{
    public Guid Id { get; set; }
    public Guid SettlementId { get; set; }
    public Guid AuctionId { get; set; }
    public required string Seller { get; set; }
    public required string Buyer { get; set; }
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public TillStatus Status { get; set; }
    public string? Slip { get; set; }
    public string? PayoutRef { get; set; }
    public string? CheckoutUrl { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? CapturedAt { get; set; }
    public DateTime? ReleasedAt { get; set; }
    public int Hammer { get; set; }
}

public class ChargeDeskDto
{
    public Guid AuctionId { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string Buyer { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public string? SessionId { get; set; }
    public string? SuccessUrl { get; set; }
    public string? CancelUrl { get; set; }
}
