namespace EmailService.DTOs;

public class LetterDto
{
    public Guid Id { get; set; }
    public required string ToUsername { get; set; }
    public required string Kind { get; set; }
    public required string Subject { get; set; }
    public required string Body { get; set; }
    public DateTime CreatedAt { get; set; }
}
