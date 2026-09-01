using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SearchService.Data;
using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Controllers;

[ApiController]
[Authorize]
[Route("api/search/pegs")]
public class PegsController(SearchDbContext db) : ControllerBase
{
    private const int MaxPegs = 12;

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SavedPegDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SavedPegDto>>> Mine(CancellationToken cancellationToken)
    {
        var name = CurrentUsername();
        if (name is null)
            return Unauthorized();

        var rows = await db.SavedPegs
            .AsNoTracking()
            .Where(x => x.Username.ToLower() == name.ToLower())
            .OrderByDescending(x => x.HungAt)
            .ToListAsync(cancellationToken);

        return Ok(rows.Select(ToDto).ToList());
    }

    [HttpPost]
    [ProducesResponseType(typeof(SavedPegDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SavedPegDto>> Hang(HangPegDto dto, CancellationToken cancellationToken)
    {
        var name = CurrentUsername();
        if (name is null)
            return Unauthorized();

        var incoming = FromDto(name, dto);
        if (!incoming.HasAnyFilter())
            return Problem(title: "Hang a filter — club, league, size, kit, or price.", statusCode: 400);

        var mine = await db.SavedPegs
            .Where(x => x.Username.ToLower() == name.ToLower())
            .ToListAsync(cancellationToken);

        var existing = mine.FirstOrDefault(x => x.SameTape(incoming));
        if (existing is not null)
            return Ok(ToDto(existing));

        if (mine.Count >= MaxPegs)
            return Problem(title: "Your tape is full. Drop one before hanging another.", statusCode: 409);

        db.SavedPegs.Add(incoming);
        await db.SaveChangesAsync(cancellationToken);
        return Ok(ToDto(incoming));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Drop(Guid id, CancellationToken cancellationToken)
    {
        var name = CurrentUsername();
        if (name is null)
            return Unauthorized();

        var row = await db.SavedPegs.FirstOrDefaultAsync(
            x => x.Id == id && x.Username.ToLower() == name.ToLower(),
            cancellationToken);

        if (row is null)
            return NotFound();

        db.SavedPegs.Remove(row);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private string? CurrentUsername() =>
        User.Identity?.Name
        ?? User.FindFirstValue("unique_name")
        ?? User.FindFirstValue(ClaimTypes.Name);

    private static SavedPeg FromDto(string username, HangPegDto dto) => new()
    {
        Id = Guid.NewGuid(),
        Username = username,
        Club = Blank(dto.Club),
        League = Blank(dto.League),
        Size = Blank(dto.Size)?.ToUpperInvariant(),
        KitType = Blank(dto.KitType),
        Status = Blank(dto.Status) ?? "Live",
        MinPrice = dto.MinPrice,
        MaxPrice = dto.MaxPrice,
        HungAt = DateTime.UtcNow
    };

    private static SavedPegDto ToDto(SavedPeg peg) => new()
    {
        Id = peg.Id,
        Username = peg.Username,
        Club = peg.Club,
        League = peg.League,
        Size = peg.Size,
        KitType = peg.KitType,
        Status = peg.Status,
        MinPrice = peg.MinPrice,
        MaxPrice = peg.MaxPrice,
        HungAt = peg.HungAt
    };

    private static string? Blank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
