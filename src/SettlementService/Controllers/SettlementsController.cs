using System.Security.Claims;
using Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SettlementService.DTOs;
using SettlementService.Services;

namespace SettlementService.Controllers;

[ApiController]
[Route("api/settlements")]
public class SettlementsController(ISettlementsService desks) : ControllerBase
{
    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<IReadOnlyList<SettlementDto>>> Mine(CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();
        return Ok(await desks.GetMineAsync(name, cancellationToken));
    }

    [Authorize(Roles = SquadRoles.Steward)]
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SettlementDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SettlementDto>>> All(CancellationToken cancellationToken) =>
        Ok(await desks.GetAllAsync(cancellationToken));

    [HttpGet("by-auction/{auctionId:guid}")]
    [ProducesResponseType(typeof(SettlementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ByAuction(Guid auctionId, CancellationToken cancellationToken)
    {
        var row = await desks.GetByAuctionAsync(auctionId, cancellationToken);
        return row is null ? NotFound() : Ok(row);
    }

    [Authorize]
    [HttpPost("{id:guid}/pay")]
    public async Task<IActionResult> Pay(Guid id, [FromBody] PayDeskDto? dto, CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();

        dto ??= new PayDeskDto();
        var origin = Request.Headers.Origin.FirstOrDefault()
            ?? Request.Headers.Referer.FirstOrDefault()
            ?? "http://localhost:3000";
        if (Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            origin = $"{uri.Scheme}://{uri.Authority}";
        else
            origin = "http://localhost:3000";

        dto.SuccessUrl ??= $"{origin}/profile?desk={id:D}&session_id={{CHECKOUT_SESSION_ID}}";
        dto.CancelUrl ??= $"{origin}/profile?desk={id:D}";

        var result = await desks.PayAsync(id, name, cancellationToken, dto);
        return From(result);
    }

    [Authorize]
    [HttpPost("{id:guid}/ship")]
    public async Task<IActionResult> Ship(Guid id, [FromBody] ShipDeskDto? dto, CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();
        var result = await desks.ShipAsync(id, name, dto?.Tracking, cancellationToken);
        return From(result);
    }

    [Authorize]
    [HttpPost("{id:guid}/receive")]
    public async Task<IActionResult> Receive(Guid id, CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();
        var result = await desks.ReceiveAsync(id, name, cancellationToken);
        return From(result);
    }

    [Authorize]
    [HttpPost("{id:guid}/dispute")]
    public async Task<IActionResult> Dispute(Guid id, [FromBody] DisputeDeskDto? dto, CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();
        var result = await desks.DisputeAsync(id, name, dto?.Note, cancellationToken);
        return From(result);
    }

    [Authorize(Roles = SquadRoles.Steward)]
    [HttpPost("{id:guid}/whistle")]
    public async Task<IActionResult> Whistle(Guid id, CancellationToken cancellationToken)
    {
        var result = await desks.WhistleAsync(id, cancellationToken);
        return From(result);
    }

    private string? UserName() =>
        User.Identity?.Name
        ?? User.FindFirstValue("unique_name")
        ?? User.FindFirstValue(ClaimTypes.Name);

    private IActionResult From<T>(Common.Result<T> result)
    {
        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);
        return Ok(result.Value);
    }
}
