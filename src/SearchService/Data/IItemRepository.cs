using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Data;

public interface IItemRepository
{
    Task UpsertAsync(Item item, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedResult<Item>> SearchAsync(SearchQuery query, CancellationToken cancellationToken);
    Task<long> CountAsync(CancellationToken cancellationToken);
}
