using System.ComponentModel.DataAnnotations;

namespace AuctionService.DTOs;

public class CreateAuctionDto
{
    [Range(0, int.MaxValue)]
    public int ReservePrice { get; set; }

    [Required, MaxLength(100)]
    public required string Seller { get; set; }

    [Required]
    public DateTime AuctionEnd { get; set; }

    [Required]
    public required CreateItemDto Item { get; set; }
}
