namespace SearchService.DTOs;

public class SearchQuery
{
    public string? Club { get; set; }
    public string? PlayerName { get; set; }
    public string? Status { get; set; }
    public string? Size { get; set; }
    public string? KitType { get; set; }
    public string? Condition { get; set; }
    public string? Season { get; set; }
    public int? MinPrice { get; set; }
    public int? MaxPrice { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
