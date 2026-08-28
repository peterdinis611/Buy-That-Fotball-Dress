using Contracts;
using MassTransit;
using SearchService.Data;
using SearchService.Mapping;

namespace SearchService.Consumers;

public class AuctionUpdatedConsumer(IItemRepository items, ILogger<AuctionUpdatedConsumer> logger)
    : IConsumer<AuctionUpdated>
{
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        var item = context.Message.ToItem();
        await items.UpsertAsync(item, context.CancellationToken);

        logger.LogInformation("Indexed updated auction {Id}", item.Id);
    }
}
