namespace Contracts;

public class LetterRequested
{
    public string ToUsername { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string Kind { get; set; } = "board";
}
