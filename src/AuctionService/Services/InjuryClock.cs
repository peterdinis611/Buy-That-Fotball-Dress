using AuctionService.Entities;

namespace AuctionService.Services;

public static class InjuryClock
{
    public static readonly TimeSpan Window = TimeSpan.FromMinutes(3);
    public const int Max = 3;

    public static bool TryAdd(Auction auction, DateTime now)
    {
        if (auction.Status is not Status.Live)
            return false;

        if (auction.InjuryCount >= Max)
            return false;

        var utc = now.ToUniversalTime();
        var remaining = auction.AuctionEnd.ToUniversalTime() - utc;
        if (remaining <= TimeSpan.Zero || remaining > Window)
            return false;

        auction.AuctionEnd = utc + Window;
        auction.Injury = true;
        auction.InjuryCount++;
        auction.UpdatedAt = utc;
        return true;
    }
}
