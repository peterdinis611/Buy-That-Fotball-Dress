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
        var name = User.Identity?.Name
            ?? User.FindFirstValue("unique_name")
            ?? User.FindFirstValue(ClaimTypes.Name);
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
}
