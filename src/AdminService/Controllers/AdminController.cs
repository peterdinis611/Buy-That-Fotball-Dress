using System.Security.Claims;
using AdminService.Common;
using AdminService.DTOs;
using AdminService.Services;
using Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AdminService.Controllers;

[ApiController]
[Authorize(Roles = SquadRoles.Steward)]
[Route("api/admin")]
public class AdminController(IOfficeService office) : ControllerBase
{
    [HttpGet("board")]
    [ProducesResponseType(typeof(OfficeBoardDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<OfficeBoardDto>> Board(CancellationToken cancellationToken) =>
        Ok(await office.GetBoardAsync(cancellationToken));

    [HttpGet("squad")]
    [ProducesResponseType(typeof(IReadOnlyList<SquadCardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SquadCardDto>>> Squad(CancellationToken cancellationToken) =>
        Ok(await office.GetSquadAsync(cancellationToken));

    [HttpGet("pegs")]
    [ProducesResponseType(typeof(IReadOnlyList<PegCardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PegCardDto>>> Pegs(CancellationToken cancellationToken) =>
        Ok(await office.GetPegsAsync(cancellationToken));

    [HttpGet("tills")]
    [ProducesResponseType(typeof(IReadOnlyList<TillCardDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TillCardDto>>> Tills(CancellationToken cancellationToken) =>
        Ok(await office.GetTillsAsync(cancellationToken));

    [HttpGet("clip")]
    [ProducesResponseType(typeof(IReadOnlyList<ClipMarkDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ClipMarkDto>>> Clip(CancellationToken cancellationToken) =>
        Ok(await office.GetClipAsync(cancellationToken));

    [HttpPost("pegs/{id:guid}/scratch")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Scratch(Guid id, CancellationToken cancellationToken)
    {
        var steward = UserName();
        if (steward is null) return Unauthorized();

        try
        {
            await office.ScratchPegAsync(id, steward, cancellationToken);
            return NoContent();
        }
        catch (OfficeException ex)
        {
            return Problem(title: ex.Message, statusCode: ex.StatusCode);
        }
    }

    [HttpPost("pegs/{id:guid}/verify")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Verify(Guid id, CancellationToken cancellationToken)
    {
        var steward = UserName();
        if (steward is null) return Unauthorized();

        try
        {
            await office.VerifyPegAsync(id, steward, cancellationToken);
            return NoContent();
        }
        catch (OfficeException ex)
        {
            return Problem(title: ex.Message, statusCode: ex.StatusCode);
        }
    }

    [HttpPost("tills/{id:guid}/whistle")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Whistle(Guid id, CancellationToken cancellationToken)
    {
        var steward = UserName();
        if (steward is null) return Unauthorized();

        try
        {
            await office.WhistleTillAsync(id, steward, cancellationToken);
            return NoContent();
        }
        catch (OfficeException ex)
        {
            return Problem(title: ex.Message, statusCode: ex.StatusCode);
        }
    }

    private string? UserName() =>
        User.Identity?.Name
        ?? User.FindFirstValue("unique_name")
        ?? User.FindFirstValue(ClaimTypes.Name);
}
