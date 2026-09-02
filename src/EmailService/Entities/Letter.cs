namespace EmailService.Entities;

public class Letter
{
    public Guid Id { get; set; }
    public required string ToUsername { get; set; }
    public required string Kind { get; set; }
    public required string Subject { get; set; }
    public required string Body { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
}
