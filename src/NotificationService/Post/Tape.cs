namespace NotificationService.Post;

public sealed record Letter(string ToUsername, string Subject, string Body, string Kind = "board");

public sealed record Tape(
    string Id,
    string Kind,
    string? For,
    string Eyebrow,
    string Title,
    string Detail,
    string Href);
