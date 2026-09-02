using Contracts;
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;
using NotificationService.Post;

namespace NotificationService.Consumers;

public class BidPlacedConsumer(
    IHubContext<NotificationHub> hub,
    IBoardRoom room,
    ILogger<BidPlacedConsumer> logger) : IConsumer<BidPlaced>
{
    public async Task Consume(ConsumeContext<BidPlaced> context)
    {
        var message = context.Message;
        await hub.Clients.Group(NotificationHub.BoardGroup)
            .SendAsync("BidPlaced", message, context.CancellationToken);

        if (!string.IsNullOrWhiteSpace(message.PreviousBidder))
        {
            var href = $"/auctions/{message.AuctionId:D}";
            await room.TellAsync(
                new Tape(
                    message.Id.ToString("D"),
                    "outbid",
                    message.PreviousBidder,
                    "Outbid",
                    "A shirt you were leading",
                    $"{message.Bidder} went {message.Amount}",
                    href),
                new Letter(
                    message.PreviousBidder,
                    "Outbid",
                    $"{message.Bidder} went to {message.Amount}. The lot is still live. Bid again if you want the shirt.\n{href}",
                    "outbid"),
                context.CancellationToken);
        }

        logger.LogInformation(
            "Pushed bid {BidId} of {Amount} on auction {AuctionId}",
            message.Id,
            message.Amount,
            message.AuctionId);
    }
}
