using BidService.DTOs;
using BidService.Entities;
using Contracts;

namespace BidService.Mapping;

public static class BidMapper
{
    public static BidDto ToDto(this Bid bid) => new()
    {
        Id = bid.Id,
        AuctionId = bid.AuctionId,
        Bidder = bid.Bidder,
        Amount = bid.Amount,
        CreatedAt = bid.CreatedAt
    };

    public static BidPlaced ToBidPlaced(this Bid bid, string? previousBidder = null) => new()
    {
        Id = bid.Id,
        AuctionId = bid.AuctionId,
        Bidder = bid.Bidder,
        PreviousBidder = previousBidder,
        Amount = bid.Amount,
        CreatedAt = bid.CreatedAt
    };

    public static AuctionLot ToLot(this AuctionCreated message) => new()
    {
        Id = message.Id,
        Seller = message.Seller,
        ReservePrice = message.ReservePrice,
        AuctionEnd = message.AuctionEnd,
        Status = message.Status,
        CurrentHighBid = message.CurrentHighBid
    };

    public static AuctionLot ToLot(this AuctionUpdated message) => new()
    {
        Id = message.Id,
        Seller = message.Seller,
        ReservePrice = message.ReservePrice,
        AuctionEnd = message.AuctionEnd,
        Status = message.Status,
        CurrentHighBid = message.CurrentHighBid
    };

    public static void Apply(this AuctionLot lot, AuctionUpdated message)
    {
        lot.Seller = message.Seller;
        lot.ReservePrice = message.ReservePrice;
        lot.AuctionEnd = message.AuctionEnd;
        lot.Status = message.Status;
        lot.CurrentHighBid = message.CurrentHighBid;
    }

    public static AuctionLot ToLot(this AuctionSyncDto dto) => new()
    {
        Id = dto.Id,
        Seller = dto.Seller,
        ReservePrice = dto.ReservePrice,
        AuctionEnd = dto.AuctionEnd,
        Status = dto.Status,
        CurrentHighBid = dto.CurrentHighBid
    };
}
