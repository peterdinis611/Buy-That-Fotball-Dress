using System.Security.Claims;
using BidService.Common;
using BidService.DTOs;
using BidService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BidService.Controllers;

[ApiController]
[Route("api/bids")]
public class BidsController(IBidsService bids) : ControllerBase
{
    [HttpGet("{auctionId:guid}")]
    [ProducesResponseType(typeof(IReadOnlyList<BidDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<BidDto>>> GetForAuction(
        Guid auctionId,
        CancellationToken cancellationToken)
    {
        return Ok(await bids.GetForAuctionAsync(auctionId, cancellationToken));
    }

    [Authorize]
    [HttpPost("{auctionId:guid}")]
    [ProducesResponseType(typeof(BidDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<BidDto>> Place(
        Guid auctionId,
        PlaceBidDto dto,
        CancellationToken cancellationToken)
    {
        var bidder = User.Identity?.Name
            ?? User.FindFirstValue("unique_name")
            ?? User.FindFirstValue(ClaimTypes.Name);

        if (bidder is null)
            return Unauthorized();

        var result = await bids.PlaceAsync(auctionId, bidder, dto.Amount, cancellationToken);
        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return Ok(result.Value);
    }
}
