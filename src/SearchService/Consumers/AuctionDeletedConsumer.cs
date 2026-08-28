using Contracts;
using FluentValidation;
using MassTransit;
using SearchService.Data;

namespace SearchService.Consumers;

public class AuctionDeletedConsumer(
    IItemRepository items,
    IValidator<AuctionDeleted> validator,
    ILogger<AuctionDeletedConsumer> logger) : IConsumer<AuctionDeleted>
{
    public async Task Consume(ConsumeContext<AuctionDeleted> context)
    {
        var result = await validator.ValidateAsync(context.Message, context.CancellationToken);

        if (!result.IsValid)
            throw new ValidationException(result.Errors);

        await items.DeleteAsync(context.Message.Id, context.CancellationToken);
        logger.LogInformation("Removed auction {Id} from search index", context.Message.Id);
    }
}
