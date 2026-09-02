using System.Security.Claims;
using EmailService.Data;
using EmailService.DTOs;
using EmailService.Mapping;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmailService.Controllers;

[ApiController]
[Route("api/letters")]
public class LettersController(MailDbContext db) : ControllerBase
{
    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<LetterDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<IReadOnlyList<LetterDto>>> Mine(CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();

        var key = name.Trim().ToLower();
        var rows = await db.Letters
            .AsNoTracking()
            .Where(x => x.ToUsername.ToLower() == key)
            .OrderByDescending(x => x.CreatedAt)
            .Take(80)
            .ToListAsync(cancellationToken);

        return Ok(rows.Select(x => x.ToDto()).ToList());
    }

    [Authorize]
    [HttpPost("{id:guid}/read")]
    [ProducesResponseType(typeof(LetterDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LetterDto>> Read(Guid id, CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();

        var key = name.Trim().ToLower();
        var row = await db.Letters.FirstOrDefaultAsync(
            x => x.Id == id && x.ToUsername.ToLower() == key,
            cancellationToken);
        if (row is null) return NotFound();

        row.ReadAt ??= DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return Ok(row.ToDto());
    }

    [Authorize]
    [HttpPost("read")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ReadAll(CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();

        var key = name.Trim().ToLower();
        var now = DateTime.UtcNow;
        var rows = await db.Letters
            .Where(x => x.ToUsername.ToLower() == key && x.ReadAt == null)
            .ToListAsync(cancellationToken);
        foreach (var row in rows)
            row.ReadAt = now;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private string? UserName() =>
        User.Identity?.Name
        ?? User.FindFirstValue("unique_name")
        ?? User.FindFirstValue(ClaimTypes.Name);
}
