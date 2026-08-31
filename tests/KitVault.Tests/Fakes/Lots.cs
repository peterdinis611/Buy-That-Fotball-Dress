using AuctionService.DTOs;
using AuctionService.Entities;
using AuctionService.Mapping;
using BidService.Entities;
using SearchService.Models;

namespace KitVault.Tests.Fakes;

public static class Lots
{
    public static CreateAuctionDto CreateShirt(
        string seller = "selecao.archive",
        DateTime? ends = null,
        int reserve = 400,
        bool provenance = true) => new()
    {
        Seller = seller,
        ReservePrice = reserve,
        AuctionEnd = ends ?? DateTime.UtcNow.AddDays(2),
        Item = new CreateItemDto
        {
            Club = "Brazil",
            PlayerName = "Ronaldo Nazário",
            PlayerNumber = 9,
            Season = "2002",
            Size = "m",
            Color = "Yellow",
            KitType = "Home",
            Condition = "Vintage",
            League = "World Cup",
            ImageUrl = "https://placehold.co/shirt.png",
            Match = provenance ? "World Cup final" : "  ",
            MatchDate = provenance ? new DateTime(2002, 6, 30, 12, 0, 0, DateTimeKind.Utc) : null,
            Opponent = provenance ? "Germany" : "",
            PitchPhotoUrl = provenance ? "https://placehold.co/grass.png" : null
        }
    };

    public static Auction LiveAuction(
        string seller = "selecao.archive",
        DateTime? ends = null,
        int reserve = 400,
        int? highBid = null,
        string? highBidder = null)
    {
        var auction = CreateShirt(seller, ends, reserve).ToEntity();
        auction.CurrentHighBid = highBid;
        auction.HighBidder = highBidder;
        return auction;
    }

    public static AuctionLot BidLot(
        Guid? id = null,
        string seller = "selecao.archive",
        int reserve = 400,
        string status = "Live",
        DateTime? ends = null,
        int? high = null) => new()
    {
        Id = id ?? Guid.NewGuid(),
        Seller = seller,
        ReservePrice = reserve,
        Status = status,
        AuctionEnd = ends ?? DateTime.UtcNow.AddHours(2),
        CurrentHighBid = high
    };

    public static SearchService.Models.Item SearchItem(
        Guid? id = null,
        string club = "Brazil",
        string player = "Ronaldo Nazário",
        string status = "Live",
        int reserve = 400,
        int? high = null) => new()
    {
        Id = id ?? Guid.NewGuid(),
        ReservePrice = reserve,
        Seller = "selecao.archive",
        CurrentHighBid = high,
        CreatedAt = DateTime.UtcNow.AddDays(-1),
        UpdatedAt = DateTime.UtcNow,
        AuctionEnd = DateTime.UtcNow.AddDays(1),
        Status = status,
        Club = club,
        PlayerName = player,
        PlayerNumber = 9,
        Season = "2002",
        Size = "M",
        Color = "Yellow",
        KitType = "Home",
        Condition = "Vintage",
        League = "World Cup",
        Match = "World Cup final",
        MatchDate = new DateTime(2002, 6, 30, 12, 0, 0, DateTimeKind.Utc),
        Opponent = "Germany",
        PitchPhotoUrl = "https://placehold.co/grass.png"
    };
}
