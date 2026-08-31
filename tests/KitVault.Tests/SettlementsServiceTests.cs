using Contracts;
using KitVault.Tests.Fakes;
using MassTransit;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using SettlementService.Consumers;
using SettlementService.Entities;
using SettlementService.Services;
using Xunit;

namespace KitVault.Tests;

public class SettlementsServiceTests
{
    [Fact]
    public async Task Only_the_buyer_pays()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.PayAsync(desk.Id, "selecao.archive", default);

        Assert.Equal(403, result.StatusCode);
    }

    [Fact]
    public async Task Pay_stamps_a_till_slip()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = new SettlementsService(sqlite.Db, publish, new FakeTillClient());

        var result = await service.PayAsync(desk.Id, "kitvault", default);

        Assert.True(result.IsSuccess);
        Assert.Equal(DeskStatus.Paid, result.Value!.Status);
        Assert.StartsWith("TILL-", result.Value.PaymentRef);
        await publish.Received(1).Publish(Arg.Is<SettlementPaid>(x => x.Buyer == "kitvault"), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Pay_stays_open_when_the_till_is_shut()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var till = new FakeTillClient { StatusCode = 503, Error = "The till is shut. Try again in a minute." };
        var service = new SettlementsService(sqlite.Db, publish, till);

        var result = await service.PayAsync(desk.Id, "kitvault", default);

        Assert.Equal(503, result.StatusCode);
        Assert.Equal(DeskStatus.Opened, sqlite.Db.Settlements.Single().Status);
        await publish.DidNotReceive().Publish(Arg.Any<SettlementPaid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Ship_waits_for_pay()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.ShipAsync(desk.Id, "selecao.archive", "DHL-1234", default);

        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Ship_needs_a_tracking_slip()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        desk.Status = DeskStatus.Paid;
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.ShipAsync(desk.Id, "selecao.archive", "ab", default);

        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public async Task Receive_only_after_the_shirt_leaves()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        desk.Status = DeskStatus.Paid;
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.ReceiveAsync(desk.Id, "kitvault", default);

        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Dispute_needs_a_reason()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.DisputeAsync(desk.Id, "kitvault", "no", default);

        Assert.Equal(400, result.StatusCode);
    }

    [Fact]
    public async Task Whistle_reopens_a_paid_desk()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        desk.Status = DeskStatus.Disputed;
        desk.PaidAt = DateTime.UtcNow.AddHours(-1);
        desk.DisputedBy = "kitvault";
        desk.DisputeNote = "Shirt never left the post.";
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.WhistleAsync(desk.Id, default);

        Assert.True(result.IsSuccess);
        Assert.Equal(DeskStatus.Paid, result.Value!.Status);
        Assert.Null(result.Value.DisputeNote);
    }

    [Fact]
    public async Task Whistle_is_only_for_disputes()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var desk = OpenDesk();
        sqlite.Db.Settlements.Add(desk);
        await sqlite.Db.SaveChangesAsync();
        var service = new SettlementsService(sqlite.Db, Substitute.For<IPublishEndpoint>(), new FakeTillClient());

        var result = await service.WhistleAsync(desk.Id, default);

        Assert.Equal(409, result.StatusCode);
    }

    [Fact]
    public async Task Sold_lot_opens_one_desk()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var publish = Substitute.For<IPublishEndpoint>();
        var consumer = new AuctionUpdatedConsumer(sqlite.Db, publish, NullLogger<AuctionUpdatedConsumer>.Instance);
        var sold = SoldUpdate();
        var context = Substitute.For<ConsumeContext<AuctionUpdated>>();
        context.Message.Returns(sold);
        context.CancellationToken.Returns(CancellationToken.None);

        await consumer.Consume(context);
        await consumer.Consume(context);

        Assert.Equal(1, sqlite.Db.Settlements.Count());
        var desk = sqlite.Db.Settlements.Single();
        Assert.Equal("kitvault", desk.Buyer);
        Assert.Equal(620, desk.Amount);
        await publish.Received(1).Publish(Arg.Any<SettlementOpened>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Live_lot_does_not_open_a_desk()
    {
        await using var sqlite = SqliteHarness.Settlement();
        var consumer = new AuctionUpdatedConsumer(
            sqlite.Db,
            Substitute.For<IPublishEndpoint>(),
            NullLogger<AuctionUpdatedConsumer>.Instance);
        var context = Substitute.For<ConsumeContext<AuctionUpdated>>();
        var live = SoldUpdate();
        live.Status = "Live";
        context.Message.Returns(live);
        context.CancellationToken.Returns(CancellationToken.None);

        await consumer.Consume(context);

        Assert.Empty(sqlite.Db.Settlements);
    }

    private static Settlement OpenDesk() => new()
    {
        Id = Guid.NewGuid(),
        AuctionId = Guid.NewGuid(),
        Seller = "selecao.archive",
        Buyer = "kitvault",
        Amount = 620,
        Club = "Brazil",
        PlayerName = "Ronaldo Nazário",
        Status = DeskStatus.Opened,
        OpenedAt = DateTime.UtcNow
    };

    private static AuctionUpdated SoldUpdate() => new()
    {
        Id = Guid.NewGuid(),
        ReservePrice = 400,
        Seller = "selecao.archive",
        Winner = "kitvault",
        SoldAmount = 620,
        CreatedAt = DateTime.UtcNow.AddDays(-10),
        UpdatedAt = DateTime.UtcNow,
        AuctionEnd = DateTime.UtcNow.AddMinutes(-1),
        Status = "Finished",
        Club = "Brazil",
        PlayerName = "Ronaldo Nazário",
        Season = "2002",
        Size = "M",
        Color = "Yellow",
        KitType = "Home",
        Condition = "Vintage"
    };
}
