using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AuctionService.DTOs;

public class CreateAuctionDto
{
    [Range(0, int.MaxValue)]
    public int ReservePrice { get; set; }

    [JsonIgnore]
    public string Seller { get; set; } = string.Empty;

    [Required]
    public DateTime AuctionEnd { get; set; }

    [Required]
    public required CreateItemDto Item { get; set; }
}
