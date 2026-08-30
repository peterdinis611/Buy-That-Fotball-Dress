using SettlementService.DTOs;
using SettlementService.Entities;

namespace SettlementService.Mapping;

public static class SettlementMapper
{
    public static SettlementDto ToDto(this Settlement row) => new()
    {
        Id = row.Id,
        AuctionId = row.AuctionId,
        Seller = row.Seller,
        Buyer = row.Buyer,
        Amount = row.Amount,
        Club = row.Club,
        PlayerName = row.PlayerName,
        Status = row.Status,
        PaymentRef = row.PaymentRef,
        Tracking = row.Tracking,
        OpenedAt = row.OpenedAt,
        PaidAt = row.PaidAt,
        ShippedAt = row.ShippedAt,
        ReceivedAt = row.ReceivedAt,
        DisputedBy = row.DisputedBy,
        DisputeNote = row.DisputeNote
    };
}
