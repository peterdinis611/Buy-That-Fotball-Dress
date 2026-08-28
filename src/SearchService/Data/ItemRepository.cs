using MongoDB.Bson;
using MongoDB.Driver;
using SearchService.Models;

namespace SearchService.Data;

public sealed class ItemRepository(IMongoCollection<Item> items) : IItemRepository
{
    public Task UpsertAsync(Item item, CancellationToken cancellationToken) =>
        items.ReplaceOneAsync(
            x => x.Id == item.Id,
            item,
            new ReplaceOptions { IsUpsert = true },
            cancellationToken);

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken) =>
        items.DeleteOneAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Item>> GetAllAsync(string? club, CancellationToken cancellationToken)
    {
        var filter = string.IsNullOrWhiteSpace(club)
            ? Builders<Item>.Filter.Empty
            : Builders<Item>.Filter.Regex(x => x.Club, new BsonRegularExpression(club.Trim(), "i"));

        return await items
            .Find(filter)
            .SortBy(x => x.AuctionEnd)
            .ToListAsync(cancellationToken);
    }

    public Task<long> CountAsync(CancellationToken cancellationToken) =>
        items.CountDocumentsAsync(FilterDefinition<Item>.Empty, cancellationToken: cancellationToken);
}
