using AuctionService.Consumers;
using AuctionService.Entities;
using AuctionService.Services;
using Contracts;
using KitVault.Tests.Fakes;
using MassTransit;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using Xunit;

namespace KitVault.Tests;

public class AuctionsServiceTests
{
    [Fact]
    public async Task Create_rejects_an_end_time_already_on_the_clock()
    {
        await using var sqlite = SqliteHarness.Auction();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = new AuctionsService(sqlite.Db, publish, new MemoryPitchCache());

        var result = await service.CreateAsync(Lots.CreateShirt(ends: DateTime.UtcNow.AddMinutes(-1)), "kitvault", default);

        Assert.False(result.IsSuccess);
        Assert.Equal(400, result.StatusCode);
        await publish.DidNotReceive().Publish(Arg.Any<AuctionCreated>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Create_publishes_the_lot()
    {
        await using var sqlite = SqliteHarness.Auction();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = new AuctionsService(sqlite.Db, publish, new MemoryPitchCache());

        var result = await service.CreateAsync(Lots.CreateShirt(), "selecao.archive", default);

        Assert.True(result.IsSuccess);
        Assert.Equal("Ronaldo Nazário", result.Value!.Item.PlayerName);
        Assert.Equal("Germany", result.Value.Item.Opponent);
        await publish.Received(1).Publish(Arg.Is<AuctionCreated>(x => x.Opponent == "Germany"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Update_is_only_for_the_seller()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction();
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var service = new AuctionsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new MemoryPitchCache());

        var result = await service.UpdateAsync(auction.Id, new() { Color = "White" }, "kitvault", default);

        Assert.Equal(403, result.StatusCode);
    }

    [Fact]
    public async Task Update_refuses_a_finished_lot()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction();
        auction.Status = Status.Finished;
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var service = new AuctionsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new MemoryPitchCache());

        var result = await service.UpdateAsync(auction.Id, new() { Color = "White" }, auction.Seller, default);

        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Watch_cannot_peg_your_own_shirt()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction();
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var service = new AuctionsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new MemoryPitchCache());

        var result = await service.WatchAsync(auction.Id, auction.Seller, default);

        Assert.Equal(403, result.StatusCode);
    }

    [Fact]
    public async Task Close_with_a_bid_over_reserve_sells_the_shirt()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction(ends: DateTime.UtcNow.AddMinutes(-1), highBid: 620, highBidder: "kitvault");
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = new AuctionsService(sqlite.Db, publish, new MemoryPitchCache());

        var closed = await service.CloseExpiredAsync(default);

        Assert.Equal(1, closed);
        Assert.Equal(Status.Finished, auction.Status);
        Assert.Equal("kitvault", auction.Winner);
        Assert.Equal(620, auction.SoldAmount);
        await publish.Received(1).Publish(Arg.Is<AuctionUpdated>(x => x.Status == "Finished"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Close_without_a_bid_is_reserve_not_met()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction(ends: DateTime.UtcNow.AddMinutes(-1));
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var service = new AuctionsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new MemoryPitchCache());

        await service.CloseExpiredAsync(default);

        Assert.Equal(Status.ReserveNotMet, auction.Status);
        Assert.Null(auction.Winner);
    }

    [Fact]
    public async Task Bid_consumer_stamps_the_high_bidder()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction();
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var consumer = new BidPlacedConsumer(sqlite.Db, publish, new MemoryPitchCache(), NullLogger<BidPlacedConsumer>.Instance);
        var context = Substitute.For<ConsumeContext<BidPlaced>>();
        context.Message.Returns(new BidPlaced
        {
            Id = Guid.NewGuid(),
            AuctionId = auction.Id,
            Bidder = "kitvault",
            Amount = 620,
            CreatedAt = DateTime.UtcNow
        });
        context.CancellationToken.Returns(CancellationToken.None);

        await consumer.Consume(context);

        Assert.Equal(620, auction.CurrentHighBid);
        Assert.Equal("kitvault", auction.HighBidder);
        Assert.Contains(sqlite.Db.AuctionBidders, x => x.Bidder == "kitvault");
        await publish.Received(1).Publish(Arg.Any<AuctionUpdated>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Bid_consumer_ignores_a_finished_lot()
    {
        await using var sqlite = SqliteHarness.Auction();
        var auction = Lots.LiveAuction();
        auction.Status = Status.Finished;
        sqlite.Db.Auctions.Add(auction);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var consumer = new BidPlacedConsumer(sqlite.Db, publish, new MemoryPitchCache(), NullLogger<BidPlacedConsumer>.Instance);
        var context = Substitute.For<ConsumeContext<BidPlaced>>();
        context.Message.Returns(new BidPlaced { Id = Guid.NewGuid(), AuctionId = auction.Id, Bidder = "kitvault", Amount = 900 });
        context.CancellationToken.Returns(CancellationToken.None);

        await consumer.Consume(context);

        Assert.Null(auction.HighBidder);
        await publish.DidNotReceive().Publish(Arg.Any<AuctionUpdated>(), Arg.Any<CancellationToken>());
    }
}
