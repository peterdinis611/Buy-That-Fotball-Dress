using Contracts;
using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Mapping;

public static class ItemMapper
{
    public static Item ToItem(this AuctionCreated m) => new()
    {
        Id = m.Id,
        ReservePrice = m.ReservePrice,
        Seller = m.Seller,
        Winner = m.Winner,
        SoldAmount = m.SoldAmount,
        CurrentHighBid = m.CurrentHighBid,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt,
        AuctionEnd = m.AuctionEnd,
        Status = m.Status,
        Club = m.Club,
        PlayerName = m.PlayerName,
        PlayerNumber = m.PlayerNumber,
        Season = m.Season,
        Size = m.Size,
        Color = m.Color,
        KitType = m.KitType,
        Condition = m.Condition,
        League = m.League,
        ImageUrl = m.ImageUrl,
        Match = m.Match,
        MatchDate = m.MatchDate,
        Opponent = m.Opponent,
        PitchPhotoUrl = m.PitchPhotoUrl,
        CollarPhotoUrl = m.CollarPhotoUrl,
        WashPhotoUrl = m.WashPhotoUrl,
        LabelPhotoUrl = m.LabelPhotoUrl,
        CoaUrl = m.CoaUrl,
        VerifiedBy = m.VerifiedBy,
        VerifiedAt = m.VerifiedAt
    };

    public static Item ToItem(this AuctionUpdated m) => new()
    {
        Id = m.Id,
        ReservePrice = m.ReservePrice,
        Seller = m.Seller,
        Winner = m.Winner,
        SoldAmount = m.SoldAmount,
        CurrentHighBid = m.CurrentHighBid,
        CreatedAt = m.CreatedAt,
        UpdatedAt = m.UpdatedAt,
        AuctionEnd = m.AuctionEnd,
        Status = m.Status,
        Club = m.Club,
        PlayerName = m.PlayerName,
        PlayerNumber = m.PlayerNumber,
        Season = m.Season,
        Size = m.Size,
        Color = m.Color,
        KitType = m.KitType,
        Condition = m.Condition,
        League = m.League,
        ImageUrl = m.ImageUrl,
        Match = m.Match,
        MatchDate = m.MatchDate,
        Opponent = m.Opponent,
        PitchPhotoUrl = m.PitchPhotoUrl,
        CollarPhotoUrl = m.CollarPhotoUrl,
        WashPhotoUrl = m.WashPhotoUrl,
        LabelPhotoUrl = m.LabelPhotoUrl,
        CoaUrl = m.CoaUrl,
        VerifiedBy = m.VerifiedBy,
        VerifiedAt = m.VerifiedAt
    };

    public static Item ToItem(this AuctionSyncDto auction) => new()
    {
        Id = auction.Id,
        ReservePrice = auction.ReservePrice,
        Seller = auction.Seller,
        Winner = auction.Winner,
        SoldAmount = auction.SoldAmount,
        CurrentHighBid = auction.CurrentHighBid,
        CreatedAt = auction.CreatedAt,
        UpdatedAt = auction.UpdatedAt,
        AuctionEnd = auction.AuctionEnd,
        Status = auction.Status,
        Club = auction.Item.Club,
        PlayerName = auction.Item.PlayerName,
        PlayerNumber = auction.Item.PlayerNumber,
        Season = auction.Item.Season,
        Size = auction.Item.Size,
        Color = auction.Item.Color,
        KitType = auction.Item.KitType,
        Condition = auction.Item.Condition,
        League = auction.Item.League,
        ImageUrl = auction.Item.ImageUrl,
        Match = auction.Item.Match,
        MatchDate = auction.Item.MatchDate,
        Opponent = auction.Item.Opponent,
        PitchPhotoUrl = auction.Item.PitchPhotoUrl,
        CollarPhotoUrl = auction.Item.CollarPhotoUrl,
        WashPhotoUrl = auction.Item.WashPhotoUrl,
        LabelPhotoUrl = auction.Item.LabelPhotoUrl,
        CoaUrl = auction.Item.CoaUrl,
        VerifiedBy = auction.Item.VerifiedBy,
        VerifiedAt = auction.Item.VerifiedAt
    };
}
