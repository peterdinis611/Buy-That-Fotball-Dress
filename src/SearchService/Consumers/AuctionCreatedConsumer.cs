using Contracts;
using MassTransit;
using SearchService.Data;
using SearchService.Mapping;

namespace SearchService.Consumers;

public class AuctionCreatedConsumer(IItemRepository items, ILogger<AuctionCreatedConsumer> logger)
    : IConsumer<AuctionCreated>
{
    public async Task Consume(ConsumeContext<AuctionCreated> context)
    {
        var item = context.Message.ToItem();
        await items.UpsertAsync(item, context.CancellationToken);

        logger.LogInformation(
            "Indexed created auction {Id} ({Club} {PlayerName})",
            item.Id,
            item.Club,
            item.PlayerName);
    }
}
