using System.ComponentModel.DataAnnotations;

namespace AuctionService.DTOs;

public class UpdateAuctionDto
{
    [Range(0, int.MaxValue)]
    public int? ReservePrice { get; set; }

    public DateTime? AuctionEnd { get; set; }

    [MaxLength(100)]
    public string? Club { get; set; }

    [MaxLength(100)]
    public string? PlayerName { get; set; }

    [Range(0, 99)]
    public int? PlayerNumber { get; set; }

    [MaxLength(20)]
    public string? Season { get; set; }

    [MaxLength(10)]
    public string? Size { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    [MaxLength(30)]
    public string? KitType { get; set; }

    [MaxLength(30)]
    public string? Condition { get; set; }

    [MaxLength(50)]
    public string? League { get; set; }

    [Url, MaxLength(500)]
    public string? ImageUrl { get; set; }
}
