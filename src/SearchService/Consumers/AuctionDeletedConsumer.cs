using Contracts;
using MassTransit;
using SearchService.Data;

namespace SearchService.Consumers;

public class AuctionDeletedConsumer(IItemRepository items, ILogger<AuctionDeletedConsumer> logger)
    : IConsumer<AuctionDeleted>
{
    public async Task Consume(ConsumeContext<AuctionDeleted> context)
    {
        await items.DeleteAsync(context.Message.Id, context.CancellationToken);
        logger.LogInformation("Removed auction {Id} from search index", context.Message.Id);
    }
}
