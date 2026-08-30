using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using NotificationService.Post;

namespace NotificationService.Consumers;

public class SettlementPaidConsumer(
    IHubContext<NotificationHub> hub,
    IBoardRoom room,
    ILogger<SettlementPaidConsumer> logger) : IConsumer<SettlementPaid>
{
    public async Task Consume(ConsumeContext<SettlementPaid> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("SettlementPaid", message, context.CancellationToken);

        var player = string.IsNullOrWhiteSpace(message.PlayerName) ? "the shirt" : message.PlayerName;
        var href = $"/auctions/{message.AuctionId:D}";

        if (!string.IsNullOrWhiteSpace(message.Seller))
        {
            await room.TellAsync(
                new Tape(
                    $"paid-{message.Id:D}",
                    "paid",
                    message.Seller,
                    "Paid",
                    player,
                    $"{message.Buyer} paid {message.Amount}. Ship it.",
                    href),
                new Letter(
                    message.Seller,
                    $"Paid · {player}",
                    $"{message.Buyer} paid {message.Amount} ({message.PaymentRef}). Add a tracking number at the desk and mark it shipped.\n{href}"),
                context.CancellationToken);
        }

        logger.LogInformation("Pushed desk paid {Id}", context.Message.Id);
    }
}
