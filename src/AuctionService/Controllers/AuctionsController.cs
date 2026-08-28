using AuctionService.Common;
using AuctionService.DTOs;
using AuctionService.Entities;
using AuctionService.Services;
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
        CancellationToken cancellationToken)
    {
        var auctions = await auctionsService.GetAllAsync(club, status, cancellationToken);
        return Ok(auctions);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AuctionDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await auctionsService.GetByIdAsync(id, cancellationToken);
        return ToActionResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuctionDto>> Create(
        CreateAuctionDto dto,
        CancellationToken cancellationToken)
    {
        var result = await auctionsService.CreateAsync(dto, cancellationToken);

        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AuctionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuctionDto>> Update(
        Guid id,
        UpdateAuctionDto dto,
        CancellationToken cancellationToken)
    {
        var result = await auctionsService.UpdateAsync(id, dto, cancellationToken);
        return ToActionResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await auctionsService.DeleteAsync(id, cancellationToken);

        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return NoContent();
    }

    private ActionResult<AuctionDto> ToActionResult(Result<AuctionDto> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        return Problem(title: result.Error, statusCode: result.StatusCode);
    }
}
