namespace Contracts;

public class SettlementDisputed
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public string By { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime DisputedAt { get; set; }
}
