using Contracts;
using FluentValidation;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SearchService.Data;
using SearchService.Mapping;
using SearchService.Models;

namespace SearchService.Consumers;

public class AuctionCreatedConsumer(
    IItemRepository items,
    SearchDbContext db,
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

        await TapeLettersAsync(item, context, context.CancellationToken);
    }

    private async Task TapeLettersAsync(
        Item item,
        IPublishEndpoint publish,
        CancellationToken cancellationToken)
    {
        var pegs = await db.SavedPegs.AsNoTracking().ToListAsync(cancellationToken);
        foreach (var peg in pegs)
        {
            if (!peg.Matches(item))
                continue;
            if (string.Equals(peg.Username, item.Seller, StringComparison.OrdinalIgnoreCase))
                continue;

            var price = item.CurrentHighBid ?? item.ReservePrice;
            await publish.Publish(new LetterRequested
            {
                ToUsername = peg.Username,
                Subject = $"{item.Club} {item.PlayerName} hung",
                Body = $"{item.PlayerName} · {item.Club} is on the rail at {price} €. Your tape matched."
            }, cancellationToken);
        }
    }
}
