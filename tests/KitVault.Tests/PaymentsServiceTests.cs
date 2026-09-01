using Contracts;
using KitVault.Tests.Fakes;
using MassTransit;
using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using PaymentService.Consumers;
using PaymentService.Drawer;
using PaymentService.DTOs;
using PaymentService.Entities;
using PaymentService.Services;
using Xunit;

namespace KitVault.Tests;

public class PaymentsServiceTests
{
    [Fact]
    public async Task Only_the_buyer_charges_the_till()
    {
        await using var sqlite = SqliteHarness.Payment();
        var till = HeldTill();
        sqlite.Db.Tills.Add(till);
        await sqlite.Db.SaveChangesAsync();
        var service = new TillsService(sqlite.Db, new HouseTillDrawer(), Substitute.For<IPublishEndpoint>());

        var result = await service.ChargeAsync(till.SettlementId, "selecao.archive", null, default);

        Assert.Equal(403, result.StatusCode);
        Assert.Equal(TillStatus.Held, sqlite.Db.Tills.Single().Status);
    }

    [Fact]
    public async Task Charge_stamps_a_till_slip()
    {
        await using var sqlite = SqliteHarness.Payment();
        var till = HeldTill();
        sqlite.Db.Tills.Add(till);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = new TillsService(sqlite.Db, new HouseTillDrawer(), publish);

        var result = await service.ChargeAsync(till.SettlementId, "kitvault", null, default);

        Assert.True(result.IsSuccess);
        Assert.Equal(TillStatus.Captured, result.Value!.Status);
        Assert.StartsWith("CARD-", result.Value.Slip);
        await publish.Received(1).Publish(
            Arg.Is<PaymentCaptured>(x => x.Buyer == "kitvault" && x.SettlementId == till.SettlementId),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Charge_is_idempotent()
    {
        await using var sqlite = SqliteHarness.Payment();
        var till = HeldTill();
        sqlite.Db.Tills.Add(till);
        await sqlite.Db.SaveChangesAsync();
        var publish = Substitute.For<IPublishEndpoint>();
        var service = new TillsService(sqlite.Db, new HouseTillDrawer(), publish);

        await service.ChargeAsync(till.SettlementId, "kitvault", null, default);
        var again = await service.ChargeAsync(till.SettlementId, "kitvault", null, default);

        Assert.True(again.IsSuccess);
        Assert.Equal(1, sqlite.Db.Tills.Count());
        await publish.Received(1).Publish(Arg.Any<PaymentCaptured>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Charge_needs_an_open_till()
    {
        await using var sqlite = SqliteHarness.Payment();
        var service = new TillsService(sqlite.Db, new HouseTillDrawer(), Substitute.For<IPublishEndpoint>());

        var result = await service.ChargeAsync(Guid.NewGuid(), "kitvault", new ChargeDeskDto
        {
            AuctionId = Guid.NewGuid(),
            Seller = "selecao.archive",
            Buyer = "kitvault",
            Amount = 620
        }, default);

        Assert.Equal(404, result.StatusCode);
    }

    [Fact]
    public async Task Opened_desk_opens_one_till()
    {
        await using var sqlite = SqliteHarness.Payment();
        var consumer = new SettlementOpenedConsumer(sqlite.Db, NullLogger<SettlementOpenedConsumer>.Instance);
        var opened = OpenedDesk();
        var context = Substitute.For<ConsumeContext<SettlementOpened>>();
        context.Message.Returns(opened);
        context.CancellationToken.Returns(CancellationToken.None);

        await consumer.Consume(context);
        await consumer.Consume(context);

        Assert.Equal(1, sqlite.Db.Tills.Count());
        var till = sqlite.Db.Tills.Single();
        Assert.Equal(opened.Id, till.SettlementId);
        Assert.Equal("kitvault", till.Buyer);
        Assert.Equal(TillStatus.Held, till.Status);
    }

    private static Till HeldTill() => new()
    {
        Id = Guid.NewGuid(),
        SettlementId = Guid.NewGuid(),
        AuctionId = Guid.NewGuid(),
        Seller = "selecao.archive",
        Buyer = "kitvault",
        Amount = 620,
        Club = "Brazil",
        PlayerName = "Ronaldo Nazário",
        Status = TillStatus.Held,
        OpenedAt = DateTime.UtcNow
    };

    private static SettlementOpened OpenedDesk() => new()
    {
        Id = Guid.NewGuid(),
        AuctionId = Guid.NewGuid(),
        Seller = "selecao.archive",
        Buyer = "kitvault",
        Amount = 620,
        Club = "Brazil",
        PlayerName = "Ronaldo Nazário",
        OpenedAt = DateTime.UtcNow
    };
}
