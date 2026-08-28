using Contracts;
using FluentValidation;
using MassTransit;
using SearchService.Data;
using SearchService.Mapping;
using SearchService.Models;

namespace SearchService.Consumers;

public class AuctionCreatedConsumer(
    IItemRepository items,
    IValidator<Item> validator,
    ILogger<AuctionCreatedConsumer> logger) : IConsumer<AuctionCreated>
{
    public async Task Consume(ConsumeContext<AuctionCreated> context)
    {
        var item = context.Message.ToItem();
        var result = await validator.ValidateAsync(item, context.CancellationToken);

        if (!result.IsValid)
            throw new ValidationException(result.Errors);

        await items.UpsertAsync(item, context.CancellationToken);

        logger.LogInformation(
            "Indexed created auction {Id} ({Club} {PlayerName})",
            item.Id,
            item.Club,
            item.PlayerName);
    }
}
