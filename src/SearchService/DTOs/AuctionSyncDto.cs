namespace SearchService.DTOs;

public class AuctionSyncDto
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
    public bool Injury { get; set; }
    public string Status { get; set; } = string.Empty;
    public AuctionSyncItemDto Item { get; set; } = null!;
}

public class AuctionSyncItemDto
{
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public int? PlayerNumber { get; set; }
    public string Season { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int? PitToPit { get; set; }
    public int? BackLength { get; set; }
    public int? BackNumber { get; set; }
    public string Color { get; set; } = string.Empty;
    public string KitType { get; set; } = string.Empty;
    public string Condition { get; set; } = string.Empty;
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
