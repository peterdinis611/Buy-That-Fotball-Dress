namespace AuctionService.DTOs;

public class PlayerSheetDto
{
    public List<AuctionDto> Listed { get; set; } = [];
    public List<AuctionDto> Chasing { get; set; } = [];
    public List<AuctionDto> Won { get; set; } = [];
    public List<AuctionDto> Watching { get; set; } = [];
}
