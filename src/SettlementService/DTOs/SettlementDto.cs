using SettlementService.Entities;

namespace SettlementService.DTOs;

public class SettlementDto
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public required string Seller { get; set; }
    public required string Buyer { get; set; }
    public int Hammer { get; set; }
    public int Desk { get; set; }
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public DeskStatus Status { get; set; }
    public string? PaymentRef { get; set; }
    public string? Tracking { get; set; }
    public string? CheckoutUrl { get; set; }
    public DateTime OpenedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? ShippedAt { get; set; }
    public DateTime? ReceivedAt { get; set; }
    public string? PayoutRef { get; set; }
    public string? DisputedBy { get; set; }
    public string? DisputeNote { get; set; }
}

public class ShipDeskDto
{
    public string? Tracking { get; set; }
}

public class DisputeDeskDto
{
    public string? Note { get; set; }
}
