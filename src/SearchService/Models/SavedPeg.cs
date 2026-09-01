namespace SearchService.Models;

public class SavedPeg
{
    public Guid Id { get; set; }
    public required string Username { get; set; }
    public string? Club { get; set; }
    public string? League { get; set; }
    public string? Size { get; set; }
    public string? KitType { get; set; }
    public string? Status { get; set; }
    public int? MinPrice { get; set; }
    public int? MaxPrice { get; set; }
    public DateTime HungAt { get; set; } = DateTime.UtcNow;

    public bool Matches(Item item)
    {
        if (!string.IsNullOrWhiteSpace(Club)
            && !item.Club.Contains(Club.Trim(), StringComparison.OrdinalIgnoreCase))
            return false;

        if (!string.IsNullOrWhiteSpace(League)
            && (item.League is null || !item.League.Contains(League.Trim(), StringComparison.OrdinalIgnoreCase)))
            return false;

        if (!string.IsNullOrWhiteSpace(Size)
            && !string.Equals(item.Size, Size.Trim(), StringComparison.OrdinalIgnoreCase))
            return false;

        if (!string.IsNullOrWhiteSpace(KitType)
            && !string.Equals(item.KitType, KitType.Trim(), StringComparison.OrdinalIgnoreCase))
            return false;

        if (!string.IsNullOrWhiteSpace(Status)
            && !string.Equals(item.Status, Status.Trim(), StringComparison.OrdinalIgnoreCase))
            return false;

        var price = item.CurrentHighBid ?? item.ReservePrice;
        if (MinPrice is int min && price < min)
            return false;
        if (MaxPrice is int max && price > max)
            return false;

        return true;
    }

    public bool SameTape(SavedPeg other) =>
        string.Equals(Norm(Club), Norm(other.Club), StringComparison.Ordinal)
        && string.Equals(Norm(League), Norm(other.League), StringComparison.Ordinal)
        && string.Equals(Norm(Size), Norm(other.Size), StringComparison.OrdinalIgnoreCase)
        && string.Equals(Norm(KitType), Norm(other.KitType), StringComparison.OrdinalIgnoreCase)
        && string.Equals(Norm(Status), Norm(other.Status), StringComparison.OrdinalIgnoreCase)
        && MinPrice == other.MinPrice
        && MaxPrice == other.MaxPrice;

    public bool HasAnyFilter() =>
        !string.IsNullOrWhiteSpace(Club)
        || !string.IsNullOrWhiteSpace(League)
        || !string.IsNullOrWhiteSpace(Size)
        || !string.IsNullOrWhiteSpace(KitType)
        || MinPrice is not null
        || MaxPrice is not null;

    private static string Norm(string? value) => value?.Trim().ToLowerInvariant() ?? "";
}
