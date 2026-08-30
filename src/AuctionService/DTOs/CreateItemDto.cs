using System.ComponentModel.DataAnnotations;

namespace AuctionService.DTOs;

public class CreateItemDto
{
    [Required, MaxLength(100)]
    public required string Club { get; set; }

    [Required, MaxLength(100)]
    public required string PlayerName { get; set; }

    [Range(0, 99)]
    public int? PlayerNumber { get; set; }

    [Required, MaxLength(20)]
    public required string Season { get; set; }

    [Required, MaxLength(10)]
    public required string Size { get; set; }

    [Required, MaxLength(50)]
    public required string Color { get; set; }

    [Required, MaxLength(30)]
    public required string KitType { get; set; }

    [Required, MaxLength(30)]
    public required string Condition { get; set; }

    [MaxLength(50)]
    public string? League { get; set; }

    [Url, MaxLength(500)]
    public string? ImageUrl { get; set; }

    [MaxLength(120)]
    public string? Match { get; set; }

    public DateTime? MatchDate { get; set; }

    [MaxLength(100)]
    public string? Opponent { get; set; }

    [Url, MaxLength(500)]
    public string? PitchPhotoUrl { get; set; }
}
