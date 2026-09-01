namespace AdminService.DTOs;

public class OfficeBoardDto
{
    public int Squad { get; set; }
    public int LivePegs { get; set; }
    public int FinishedPegs { get; set; }
    public int OpenTills { get; set; }
    public int DisputedTills { get; set; }
    public IReadOnlyList<ClipMarkDto> Clip { get; set; } = [];
}

public class ClipMarkDto
{
    public Guid Id { get; set; }
    public DateTime At { get; set; }
    public required string Steward { get; set; }
    public required string Verb { get; set; }
    public required string Subject { get; set; }
    public string Detail { get; set; } = string.Empty;
}

public class SquadCardDto
{
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string[] Roles { get; set; } = [];
}

public class PegCardDto
{
    public Guid Id { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime AuctionEnd { get; set; }
    public int? CurrentHighBid { get; set; }
    public PegItemDto Item { get; set; } = new();
}

public class PegItemDto
{
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public string Season { get; set; } = string.Empty;
    public string? VerifiedBy { get; set; }
}

public class TillCardDto
{
    public Guid Id { get; set; }
    public Guid AuctionId { get; set; }
    public string Seller { get; set; } = string.Empty;
    public string Buyer { get; set; } = string.Empty;
    public int Amount { get; set; }
    public string Club { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? DisputeNote { get; set; }
    public string? DisputedBy { get; set; }
    public DateTime OpenedAt { get; set; }
}
