using AuctionService.DTOs;
using AuctionService.Entities;
using Contracts;

namespace AuctionService.Mapping;

public static class AuctionMapper
{
    public static AuctionDto ToDto(this Auction auction) => new()
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
        Item = auction.Item.ToDto()
    };

    public static ItemDto ToDto(this Item item) => new()
    {
        Id = item.Id,
        Club = item.Club,
        PlayerName = item.PlayerName,
        PlayerNumber = item.PlayerNumber,
        Season = item.Season,
        Size = item.Size,
        Color = item.Color,
        KitType = item.KitType,
        Condition = item.Condition,
        League = item.League,
        ImageUrl = item.ImageUrl
    };

    public static Auction ToEntity(this CreateAuctionDto dto)
    {
        var now = DateTime.UtcNow;

        return new Auction
        {
            Id = Guid.NewGuid(),
            ReservePrice = dto.ReservePrice,
            Seller = dto.Seller.Trim(),
            AuctionEnd = dto.AuctionEnd.ToUniversalTime(),
            Status = Status.Live,
            CreatedAt = now,
            UpdatedAt = now,
            Item = new Item
            {
                Id = Guid.NewGuid(),
                Club = dto.Item.Club.Trim(),
                PlayerName = dto.Item.PlayerName.Trim(),
                PlayerNumber = dto.Item.PlayerNumber,
                Season = dto.Item.Season.Trim(),
                Size = dto.Item.Size.Trim().ToUpperInvariant(),
                Color = dto.Item.Color.Trim(),
                KitType = dto.Item.KitType.Trim(),
                Condition = dto.Item.Condition.Trim(),
                League = dto.Item.League?.Trim(),
                ImageUrl = dto.Item.ImageUrl
            }
        };
    }

    public static void ApplyUpdate(this Auction auction, UpdateAuctionDto dto)
    {
        if (dto.ReservePrice is not null)
            auction.ReservePrice = dto.ReservePrice.Value;

        if (dto.AuctionEnd is not null)
            auction.AuctionEnd = dto.AuctionEnd.Value.ToUniversalTime();

        if (dto.Club is not null)
            auction.Item.Club = dto.Club.Trim();

        if (dto.PlayerName is not null)
            auction.Item.PlayerName = dto.PlayerName.Trim();

        if (dto.PlayerNumber is not null)
            auction.Item.PlayerNumber = dto.PlayerNumber;

        if (dto.Season is not null)
            auction.Item.Season = dto.Season.Trim();

        if (dto.Size is not null)
            auction.Item.Size = dto.Size.Trim().ToUpperInvariant();

        if (dto.Color is not null)
            auction.Item.Color = dto.Color.Trim();

        if (dto.KitType is not null)
            auction.Item.KitType = dto.KitType.Trim();

        if (dto.Condition is not null)
            auction.Item.Condition = dto.Condition.Trim();

        if (dto.League is not null)
            auction.Item.League = dto.League.Trim();

        if (dto.ImageUrl is not null)
            auction.Item.ImageUrl = dto.ImageUrl;

        auction.UpdatedAt = DateTime.UtcNow;
    }

    public static AuctionCreated ToAuctionCreated(this Auction auction) => new()
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
        Status = auction.Status.ToString(),
        Club = auction.Item.Club,
        PlayerName = auction.Item.PlayerName,
        PlayerNumber = auction.Item.PlayerNumber,
        Season = auction.Item.Season,
        Size = auction.Item.Size,
        Color = auction.Item.Color,
        KitType = auction.Item.KitType,
        Condition = auction.Item.Condition,
        League = auction.Item.League,
        ImageUrl = auction.Item.ImageUrl
    };

    public static AuctionUpdated ToAuctionUpdated(this Auction auction) => new()
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
        Status = auction.Status.ToString(),
        Club = auction.Item.Club,
        PlayerName = auction.Item.PlayerName,
        PlayerNumber = auction.Item.PlayerNumber,
        Season = auction.Item.Season,
        Size = auction.Item.Size,
        Color = auction.Item.Color,
        KitType = auction.Item.KitType,
        Condition = auction.Item.Condition,
        League = auction.Item.League,
        ImageUrl = auction.Item.ImageUrl
    };
}
