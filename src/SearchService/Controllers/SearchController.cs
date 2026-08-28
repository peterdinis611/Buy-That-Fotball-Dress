using Microsoft.AspNetCore.Mvc;
using SearchService.Data;
using SearchService.Models;

namespace SearchService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(IItemRepository items) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<Item>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<Item>>> Get(
        [FromQuery] string? club,
        CancellationToken cancellationToken)
    {
        var results = await items.GetAllAsync(club, cancellationToken);
        return Ok(results);
    }
}
