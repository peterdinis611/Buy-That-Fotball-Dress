using PaymentService.DTOs;
using PaymentService.Entities;

namespace PaymentService.Mapping;

public static class TillMapper
{
    public static TillDto ToDto(this Till row) => new()
    {
        Id = row.Id,
        SettlementId = row.SettlementId,
        AuctionId = row.AuctionId,
        Seller = row.Seller,
        Buyer = row.Buyer,
        Amount = row.Amount,
        Hammer = row.Hammer,
        Club = row.Club,
        PlayerName = row.PlayerName,
        Status = row.Status,
        Slip = row.Slip,
        PayoutRef = row.PayoutRef,
        OpenedAt = row.OpenedAt,
        CapturedAt = row.CapturedAt,
        ReleasedAt = row.ReleasedAt
    };
}
