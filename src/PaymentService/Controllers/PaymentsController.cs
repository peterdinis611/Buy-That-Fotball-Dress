using System.Security.Claims;
using Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.DTOs;
using PaymentService.Services;

namespace PaymentService.Controllers;

[ApiController]
[Route("api/payments")]
public class PaymentsController(ITillsService tills) : ControllerBase
{
    [Authorize]
    [HttpGet("mine")]
    public async Task<ActionResult<IReadOnlyList<TillDto>>> Mine(CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();
        return Ok(await tills.GetMineAsync(name, cancellationToken));
    }

    [Authorize(Roles = SquadRoles.Steward)]
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TillDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<TillDto>>> All(CancellationToken cancellationToken) =>
        Ok(await tills.GetAllAsync(cancellationToken));

    [HttpGet("by-settlement/{settlementId:guid}")]
    [ProducesResponseType(typeof(TillDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> BySettlement(Guid settlementId, CancellationToken cancellationToken)
    {
        var row = await tills.GetBySettlementAsync(settlementId, cancellationToken);
        return row is null ? NotFound() : Ok(row);
    }

    [Authorize]
    [HttpPost("{settlementId:guid}/charge")]
    public async Task<IActionResult> Charge(
        Guid settlementId,
        [FromBody] ChargeDeskDto? desk,
        CancellationToken cancellationToken)
    {
        var name = UserName();
        if (name is null) return Unauthorized();
        var result = await tills.ChargeAsync(settlementId, name, desk, cancellationToken);
        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);
        return Ok(result.Value);
    }

    private string? UserName() =>
        User.Identity?.Name
        ?? User.FindFirstValue("unique_name")
        ?? User.FindFirstValue(ClaimTypes.Name);
}
