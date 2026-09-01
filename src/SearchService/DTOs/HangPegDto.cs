namespace SearchService.DTOs;

public class HangPegDto
{
    public string? Club { get; set; }
    public string? League { get; set; }
    public string? Size { get; set; }
    public string? KitType { get; set; }
    public string? Status { get; set; }
    public int? MinPrice { get; set; }
    public int? MaxPrice { get; set; }
}

public class SavedPegDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? Club { get; set; }
    public string? League { get; set; }
    public string? Size { get; set; }
    public string? KitType { get; set; }
    public string? Status { get; set; }
    public int? MinPrice { get; set; }
    public int? MaxPrice { get; set; }
    public DateTime HungAt { get; set; }
}
