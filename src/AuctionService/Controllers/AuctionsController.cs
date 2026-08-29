using System.Security.Claims;
using AuctionService.Common;
using AuctionService.DTOs;
using AuctionService.Entities;
using AuctionService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuctionService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuctionsController(IAuctionsService auctionsService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<AuctionDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<AuctionDto>>> GetAll(
        [FromQuery] string? club,
        [FromQuery] Status? status,
        [FromQuery] string? seller,
        CancellationToken cancellationToken)
    {
        var auctions = await auctionsService.GetAllAsync(club, status, seller, cancellationToken);
        return Ok(auctions);
    }

    [Authorize]
    [HttpGet("mine")]
    [ProducesResponseType(typeof(PlayerSheetDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<PlayerSheetDto>> GetMine(CancellationToken cancellationToken)
    {
        var username = CurrentUsername();
        if (username is null)
            return Unauthorized();

        var result = await auctionsService.GetPlayerSheetAsync(username, cancellationToken);
        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuctionDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await auctionsService.GetByIdAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuctionDto>> Create(
        CreateAuctionDto dto,
        CancellationToken cancellationToken)
    {
        var seller = CurrentUsername();
        if (seller is null)
            return Unauthorized();

        var result = await auctionsService.CreateAsync(dto, seller, cancellationToken);

        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [Authorize]
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuctionDto>> Update(
        Guid id,
        UpdateAuctionDto dto,
        CancellationToken cancellationToken)
    {
        var seller = CurrentUsername();
        if (seller is null)
            return Unauthorized();

        var result = await auctionsService.UpdateAsync(id, dto, seller, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var seller = CurrentUsername();
        if (seller is null)
            return Unauthorized();

        var result = await auctionsService.DeleteAsync(id, seller, cancellationToken);

        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return NoContent();
    }

    [Authorize]
    [HttpPost("{id:guid}/watch")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Watch(Guid id, CancellationToken cancellationToken)
    {
        var watcher = CurrentUsername();
        if (watcher is null)
            return Unauthorized();

        var result = await auctionsService.WatchAsync(id, watcher, cancellationToken);
        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:guid}/watch")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Unwatch(Guid id, CancellationToken cancellationToken)
    {
        var watcher = CurrentUsername();
        if (watcher is null)
            return Unauthorized();

        var result = await auctionsService.UnwatchAsync(id, watcher, cancellationToken);
        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return NoContent();
    }

    private string? CurrentUsername() =>
        User.Identity?.Name
        ?? User.FindFirstValue("unique_name")
        ?? User.FindFirstValue(ClaimTypes.Name);

    private ActionResult<AuctionDto> ToActionResult(Result<AuctionDto> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        return Problem(title: result.Error, statusCode: result.StatusCode);
    }
}
