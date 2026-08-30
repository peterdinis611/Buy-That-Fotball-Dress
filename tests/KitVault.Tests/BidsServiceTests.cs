using BidService.Entities;
using BidService.Mapping;
using BidService.Services;
using Contracts;
using KitVault.Tests.Fakes;
using MassTransit;
using NSubstitute;
using Xunit;

namespace KitVault.Tests;

public class BidsServiceTests
{
    [Fact]
    public async Task Place_rejects_nothing()
    {
        await using var sqlite = SqliteHarness.Bid();
        var service = NewService(sqlite);

        var result = await service.PlaceAsync(Guid.NewGuid(), "kitvault", 0, default);

        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public async Task Place_rejects_the_seller()
    {
        await using var sqlite = SqliteHarness.Bid();
        var lot = Lots.BidLot();
        sqlite.Db.Lots.Add(lot);
        await sqlite.Db.SaveChangesAsync();
        var service = NewService(sqlite);

        var result = await service.PlaceAsync(lot.Id, lot.Seller, 500, default);

        Assert.Equal(403, result.StatusCode);
    }

    [Fact]
    public async Task Place_rejects_a_dead_clock()
    {
        await using var sqlite = SqliteHarness.Bid();
        var lot = Lots.BidLot(ends: DateTime.UtcNow.AddMinutes(-1));
        sqlite.Db.Lots.Add(lot);
        await sqlite.Db.SaveChangesAsync();
        var service = NewService(sqlite);

        var result = await service.PlaceAsync(lot.Id, "kitvault", 500, default);

        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task First_shot_must_meet_reserve()
    {
        await using var sqlite = SqliteHarness.Bid();
        var lot = Lots.BidLot(reserve: 400);
        sqlite.Db.Lots.Add(lot);
        await sqlite.Db.SaveChangesAsync();
        var service = NewService(sqlite);

        var result = await service.PlaceAsync(lot.Id, "kitvault", 399, default);

        Assert.Equal(400, result.StatusCode);
        Assert.Contains("400", result.Error);
    }

    [Fact]
    public async Task Next_shot_must_beat_the_board()
    {
        await using var sqlite = SqliteHarness.Bid();
        var lot = Lots.BidLot(reserve: 400, high: 500);
        sqlite.Db.Lots.Add(lot);
        sqlite.Db.Bids.Add(new Bid
        {
            Id = Guid.NewGuid(),
            AuctionId = lot.Id,
            Lot = lot,
            Bidder = "jerseyhunter",
            Amount = 500,
            CreatedAt = DateTime.UtcNow.AddMinutes(-2)
        });
        await sqlite.Db.SaveChangesAsync();
        var service = NewService(sqlite);

        var result = await service.PlaceAsync(lot.Id, "kitvault", 500, default);

        Assert.Equal(400, result.StatusCode);
        Assert.Contains("501", result.Error);
    }

    [Fact]
    public async Task Outbid_names_the_previous_bidder()
    {
        await using var sqlite = SqliteHarness.Bid();
        var lot = Lots.BidLot(reserve: 400);
        sqlite.Db.Lots.Add(lot);
        sqlite.Db.Bids.Add(new Bid
        {
            Id = Guid.NewGuid(),
            AuctionId = lot.Id,
            Lot = lot,
            Bidder = "jerseyhunter",
            Amount = 400,
            CreatedAt = DateTime.UtcNow.AddMinutes(-2)
        });
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = NewService(sqlite, publish);

        var result = await service.PlaceAsync(lot.Id, "kitvault", 450, default);

        Assert.True(result.IsSuccess);
        await publish.Received(1).Publish(
            Arg.Is<BidPlaced>(x => x.Bidder == "kitvault" && x.PreviousBidder == "jerseyhunter" && x.Amount == 450),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public void Created_event_becomes_a_lot()
    {
        var lot = new AuctionCreated
        {
            Id = Guid.NewGuid(),
            Seller = "kitvault",
            ReservePrice = 250,
            AuctionEnd = DateTime.UtcNow.AddDays(1),
            Status = "Live",
            CurrentHighBid = null
        }.ToLot();

        Assert.Equal("kitvault", lot.Seller);
        Assert.Equal(250, lot.ReservePrice);
        Assert.Equal("Live", lot.Status);
    }

    private static BidsService NewService(SqliteHarness<BidService.Data.BidDbContext> sqlite, IPublishEndpoint? publish = null) =>
        new(sqlite.Db, publish ?? Substitute.For<IPublishEndpoint>(), Substitute.For<IHttpClientFactory>(), new MemoryPitchCache());
}
