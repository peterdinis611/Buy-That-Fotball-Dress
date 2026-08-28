namespace Contracts;

public class AuctionCreated
{
    public Guid Id { get; set; }
    public int ReservePrice { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string? Winner { get; set; }
    public int? SoldAmount { get; set; }
    public int? CurrentHighBid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime AuctionEnd { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public int? PlayerNumber { get; set; }
    public string Season { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string KitType { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
    public string? League { get; set; }
    public string? ImageUrl { get; set; }
}
