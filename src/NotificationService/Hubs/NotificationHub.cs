using Microsoft.AspNetCore.SignalR;

namespace NotificationService.Hubs;

public class NotificationHub : Hub
{
    public const string BoardGroup = "board";

    public static string AuctionGroup(Guid auctionId) => $"auction-{auctionId:D}";

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, BoardGroup);
        await base.OnConnectedAsync();
    }

    public Task JoinAuction(Guid auctionId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, AuctionGroup(auctionId));

    public Task LeaveAuction(Guid auctionId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, AuctionGroup(auctionId));
}
