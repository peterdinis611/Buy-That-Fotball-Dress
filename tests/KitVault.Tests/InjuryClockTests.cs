using AuctionService.Entities;
using AuctionService.Services;
using KitVault.Tests.Fakes;
using Xunit;

namespace KitVault.Tests;

public class InjuryClockTests
{
    [Fact]
    public void Adds_three_minutes_inside_the_window()
    {
        var now = DateTime.UtcNow;
        var auction = Lots.LiveAuction(ends: now.AddMinutes(2));

        var added = InjuryClock.TryAdd(auction, now);

        Assert.True(added);
        Assert.True(auction.Injury);
        Assert.Equal(now.AddMinutes(3), auction.AuctionEnd, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Leaves_a_lot_with_time_on_the_clock()
    {
        var now = DateTime.UtcNow;
        var auction = Lots.LiveAuction(ends: now.AddMinutes(10));

        Assert.False(InjuryClock.TryAdd(auction, now));
        Assert.False(auction.Injury);
    }

    [Fact]
    public void Leaves_a_dead_clock()
    {
        var now = DateTime.UtcNow;
        var auction = Lots.LiveAuction(ends: now.AddMinutes(-1));

        Assert.False(InjuryClock.TryAdd(auction, now));
        Assert.Equal(Status.Live, auction.Status);
    }
}
