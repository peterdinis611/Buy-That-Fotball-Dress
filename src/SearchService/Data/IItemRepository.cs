using SearchService.Models;

namespace SearchService.Data;

public interface IItemRepository
{
    Task UpsertAsync(Item item, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Item>> GetAllAsync(string? club, CancellationToken cancellationToken);
    Task<long> CountAsync(CancellationToken cancellationToken);
}
