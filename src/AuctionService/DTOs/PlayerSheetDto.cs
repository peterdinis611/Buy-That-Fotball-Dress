namespace AuctionService.DTOs;

public class PlayerSheetDto
{
    public IReadOnlyList<AuctionDto> Listed { get; set; } = [];
    public IReadOnlyList<AuctionDto> Chasing { get; set; } = [];
    public IReadOnlyList<AuctionDto> Won { get; set; } = [];
}
