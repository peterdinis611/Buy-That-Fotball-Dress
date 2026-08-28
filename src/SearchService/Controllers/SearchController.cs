using Microsoft.AspNetCore.Mvc;
using SearchService.Data;
using SearchService.DTOs;
using SearchService.Models;

namespace SearchService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(IItemRepository items) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<Item>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<Item>>> Get(
        [FromQuery] SearchQuery query,
        CancellationToken cancellationToken)
    {
        var results = await items.SearchAsync(query, cancellationToken);
        return Ok(results);
    }
}
