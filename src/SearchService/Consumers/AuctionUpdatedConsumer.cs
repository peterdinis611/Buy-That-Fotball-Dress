using Contracts;
using FluentValidation;
using MassTransit;
using SearchService.Data;
using SearchService.Mapping;
using SearchService.Models;

namespace SearchService.Consumers;

public class AuctionUpdatedConsumer(
    IItemRepository items,
    IValidator<Item> validator,
    ILogger<AuctionUpdatedConsumer> logger) : IConsumer<AuctionUpdated>
{
    public async Task Consume(ConsumeContext<AuctionUpdated> context)
    {
        var item = context.Message.ToItem();
        var result = await validator.ValidateAsync(item, context.CancellationToken);

        if (!result.IsValid)
            throw new ValidationException(result.Errors);

        await items.UpsertAsync(item, context.CancellationToken);

        logger.LogInformation("Indexed updated auction {Id}", item.Id);
    }
}
