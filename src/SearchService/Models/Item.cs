using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SearchService.Models;

public class Item
{
    [BsonId]
    [BsonRepresentation(BsonType.String)]
    public Guid Id { get; set; }

    public int ReservePrice { get; set; }
    public required string Seller { get; set; }
    public string? Winner { get; set; }
    public int? SoldAmount { get; set; }
    public int? CurrentHighBid { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime AuctionEnd { get; set; }
    public required string Status { get; set; }
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
