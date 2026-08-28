namespace SearchService.DTOs;

public class PagedResult<T>
{
    public List<T> Results { get; init; } = [];
    public int Page { get; init; }
    public int PageSize { get; init; }
    public long TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
