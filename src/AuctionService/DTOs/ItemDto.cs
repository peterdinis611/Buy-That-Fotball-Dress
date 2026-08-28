namespace AuctionService.DTOs;

public class ItemDto
{
    public Guid Id { get; set; }
    public required string Club { get; set; }
    public required string PlayerName { get; set; }
    public int? PlayerNumber { get; set; }
    public required string Season { get; set; }
    public required string Size { get; set; }
    public required string Color { get; set; }
    public required string KitType { get; set; }
    public required string Condition { get; set; }
    public string? League { get; set; }
    public string? ImageUrl { get; set; }
}
