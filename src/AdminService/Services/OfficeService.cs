using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using AdminService.Common;
using AdminService.Data;
using AdminService.DTOs;
using AdminService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AdminService.Services;

public sealed class OfficeService(IHttpClientFactory http, OfficeDbContext db) : IOfficeService
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public async Task<OfficeBoardDto> GetBoardAsync(CancellationToken cancellationToken)
    {
        var squad = await Safe(() => GetSquadAsync(cancellationToken));
        var pegs = await Safe(() => GetPegsAsync(cancellationToken));
        var tills = await Safe(() => GetTillsAsync(cancellationToken));
        var clip = await GetClipAsync(cancellationToken);

        return new OfficeBoardDto
        {
            Squad = squad.Count,
            LivePegs = pegs.Count(x => x.Status == "Live"),
            FinishedPegs = pegs.Count(x => x.Status == "Finished"),
            OpenTills = tills.Count(x => x.Status is "Opened" or "Paid" or "Shipped"),
            DisputedTills = tills.Count(x => x.Status == "Disputed"),
            Clip = clip
        };
    }

    public async Task<IReadOnlyList<SquadCardDto>> GetSquadAsync(CancellationToken cancellationToken)
    {
        var rows = await GetJsonAsync<SquadCardDto>("Identity", "/api/auth/squad", cancellationToken);
        return rows;
    }

    public async Task<IReadOnlyList<PegCardDto>> GetPegsAsync(CancellationToken cancellationToken)
    {
        var rows = await GetJsonAsync<PegCardDto>("Auction", "/api/auctions", cancellationToken);
        return rows;
    }

    public async Task<IReadOnlyList<TillCardDto>> GetTillsAsync(CancellationToken cancellationToken)
    {
        var rows = await GetJsonAsync<TillCardDto>("Settlement", "/api/settlements", cancellationToken);
        return rows;
    }

    public async Task<IReadOnlyList<ClipMarkDto>> GetClipAsync(CancellationToken cancellationToken)
    {
        var rows = await db.Clip
            .OrderByDescending(x => x.At)
            .Take(24)
            .ToListAsync(cancellationToken);

        return rows.Select(ToDto).ToList();
    }

    public async Task ScratchPegAsync(Guid id, string steward, CancellationToken cancellationToken)
    {
        var pegs = await GetPegsAsync(cancellationToken);
        var peg = pegs.FirstOrDefault(x => x.Id == id);
        var client = http.CreateClient("Auction");
        using var response = await client.PostAsync($"/api/auctions/{id}/scratch", null, cancellationToken);
        await EnsureOk(response, "Could not scratch that peg.");
        await MarkAsync(steward, "scratch", ShirtLine(peg), peg?.Seller ?? id.ToString(), cancellationToken);
    }

    public async Task WhistleTillAsync(Guid id, string steward, CancellationToken cancellationToken)
    {
        var tills = await GetTillsAsync(cancellationToken);
        var till = tills.FirstOrDefault(x => x.Id == id);
        var client = http.CreateClient("Settlement");
        using var response = await client.PostAsync($"/api/settlements/{id}/whistle", null, cancellationToken);
        await EnsureOk(response, "Could not blow the whistle on that desk.");
        await MarkAsync(
            steward,
            "whistle",
            till is null ? id.ToString() : $"{till.PlayerName} · {till.Buyer} / {till.Seller}",
            till?.DisputeNote ?? "",
            cancellationToken);
    }

    private async Task<List<T>> GetJsonAsync<T>(string clientName, string path, CancellationToken cancellationToken)
    {
        var client = http.CreateClient(clientName);
        using var response = await client.GetAsync(path, cancellationToken);
        if (!response.IsSuccessStatusCode)
            return [];

        return await response.Content.ReadFromJsonAsync<List<T>>(Json, cancellationToken) ?? [];
    }

    private static async Task<IReadOnlyList<T>> Safe<T>(Func<Task<IReadOnlyList<T>>> load)
    {
        try
        {
            return await load();
        }
        catch
        {
            return [];
        }
    }

    private async Task MarkAsync(
        string steward,
        string verb,
        string subject,
        string detail,
        CancellationToken cancellationToken)
    {
        db.Clip.Add(new ClipMark
        {
            Id = Guid.NewGuid(),
            At = DateTime.UtcNow,
            Steward = steward,
            Verb = verb,
            Subject = subject,
            Detail = detail.Length > 400 ? detail[..400] : detail
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private static async Task EnsureOk(HttpResponseMessage response, string fallback)
    {
        if (response.IsSuccessStatusCode) return;

        var title = fallback;
        try
        {
            var body = await response.Content.ReadFromJsonAsync<ProblemHint>(Json);
            if (!string.IsNullOrWhiteSpace(body?.Title))
                title = body.Title;
        }
        catch
        {
            // keep fallback
        }

        throw new OfficeException(title, (int)response.StatusCode);
    }

    private static string ShirtLine(PegCardDto? peg) =>
        peg is null ? "Unknown peg" : $"{peg.Item.Club} / {peg.Item.PlayerName}";

    private static ClipMarkDto ToDto(ClipMark row) => new()
    {
        Id = row.Id,
        At = row.At,
        Steward = row.Steward,
        Verb = row.Verb,
        Subject = row.Subject,
        Detail = row.Detail
    };

    private sealed class ProblemHint
    {
        public string? Title { get; set; }
    }
}
