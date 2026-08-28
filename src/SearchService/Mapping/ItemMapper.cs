using Contracts;
using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Mapping;

public static class ItemMapper
{
    public static Item ToItem(this AuctionCreated message) => Create(
        message.Id,
        message.ReservePrice,
        message.Seller,
        message.Winner,
        message.SoldAmount,
        message.CurrentHighBid,
        message.CreatedAt,
        message.UpdatedAt,
        message.AuctionEnd,
        message.Status,
        message.Club,
        message.PlayerName,
        message.PlayerNumber,
        message.Season,
        message.Size,
        message.Color,
        message.KitType,
        message.Condition,
        message.League,
        message.ImageUrl);

    public static Item ToItem(this AuctionUpdated message) => Create(
        message.Id,
        message.ReservePrice,
        message.Seller,
        message.Winner,
        message.SoldAmount,
        message.CurrentHighBid,
        message.CreatedAt,
        message.UpdatedAt,
        message.AuctionEnd,
        message.Status,
        message.Club,
        message.PlayerName,
        message.PlayerNumber,
        message.Season,
        message.Size,
        message.Color,
        message.KitType,
        message.Condition,
        message.League,
        message.ImageUrl);

    public static Item ToItem(this AuctionSyncDto auction) => Create(
        auction.Id,
        auction.ReservePrice,
        auction.Seller,
        auction.Winner,
        auction.SoldAmount,
        auction.CurrentHighBid,
        auction.CreatedAt,
        auction.UpdatedAt,
        auction.AuctionEnd,
        auction.Status,
        auction.Item.Club,
        auction.Item.PlayerName,
        auction.Item.PlayerNumber,
        auction.Item.Season,
        auction.Item.Size,
        auction.Item.Color,
        auction.Item.KitType,
        auction.Item.Condition,
        auction.Item.League,
        auction.Item.ImageUrl);

    private static Item Create(
        Guid id,
        int reservePrice,
        string seller,
        string? winner,
        int? soldAmount,
        int? currentHighBid,
        DateTime createdAt,
        DateTime updatedAt,
        DateTime auctionEnd,
        string status,
        string club,
        string playerName,
        int? playerNumber,
        string season,
        string size,
        string color,
        string kitType,
        string condition,
        string? league,
        string? imageUrl) => new()
    {
        Id = id,
        ReservePrice = reservePrice,
        Seller = seller,
        Winner = winner,
        SoldAmount = soldAmount,
        CurrentHighBid = currentHighBid,
        CreatedAt = createdAt,
        UpdatedAt = updatedAt,
        AuctionEnd = auctionEnd,
        Status = status,
        Club = club,
        PlayerName = playerName,
        PlayerNumber = playerNumber,
        Season = season,
        Size = size,
        Color = color,
        KitType = kitType,
        Condition = condition,
        League = league,
        ImageUrl = imageUrl
    };
}
