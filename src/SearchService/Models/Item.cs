namespace SearchService.Models;

public class Item
{
    public Guid Id { get; set; }
    public int ReservePrice { get; set; }
    public required string Seller { get; set; }
    public string? Winner { get; set; }
    public int? SoldAmount { get; set; }
    public int? CurrentHighBid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime AuctionEnd { get; set; }
    public bool Injury { get; set; }
    public required string Status { get; set; }
    public required string Club { get; set; }
    public required string PlayerName { get; set; }
    public int? PlayerNumber { get; set; }
    public required string Season { get; set; }
    public required string Size { get; set; }
    public int? PitToPit { get; set; }
    public int? BackLength { get; set; }
    public int? BackNumber { get; set; }
    public required string Color { get; set; }
    public required string KitType { get; set; }
    public required string Condition { get; set; }
    public string? League { get; set; }
    public string? ImageUrl { get; set; }
    public string? Match { get; set; }
    public DateTime? MatchDate { get; set; }
    public string? Opponent { get; set; }
    public string? PitchPhotoUrl { get; set; }
    public string? CollarPhotoUrl { get; set; }
    public string? WashPhotoUrl { get; set; }
    public string? LabelPhotoUrl { get; set; }
    public string? CoaUrl { get; set; }
    public string? VerifiedBy { get; set; }
    public DateTime? VerifiedAt { get; set; }
}
