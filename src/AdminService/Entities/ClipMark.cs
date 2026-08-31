namespace AdminService.Entities;

public class ClipMark
{
    public Guid Id { get; set; }
    public DateTime At { get; set; } = DateTime.UtcNow;
    public required string Steward { get; set; }
    public required string Verb { get; set; }
    public required string Subject { get; set; }
    public string Detail { get; set; } = string.Empty;
}
