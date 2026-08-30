using System.Security.Claims;
using IdentityService.Common;
using IdentityService.DTOs;
using IdentityService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IIdentityService identityService) : ControllerBase
{
    [HttpPost("register")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<UserDto>> Register(RegisterDto dto, CancellationToken cancellationToken)
    {
        var result = await identityService.RegisterAsync(dto, cancellationToken);

        if (!result.IsSuccess)
            return Problem(title: result.Error, statusCode: result.StatusCode);

        return CreatedAtAction(nameof(Me), value: result.Value);
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserDto>> Login(LoginDto dto, CancellationToken cancellationToken)
    {
        var result = await identityService.LoginAsync(dto, cancellationToken);
        return ToActionResult(result);
    }

    [Authorize]
    [HttpGet("me")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> Me(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var result = await identityService.GetCurrentAsync(userId, cancellationToken);
        return ToActionResult(result);
    }

    [HttpGet("users/{username}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> ByUsername(string username, CancellationToken cancellationToken)
    {
        var result = await identityService.GetByUsernameAsync(username, cancellationToken);
        return ToActionResult(result);
    }

    private ActionResult<UserDto> ToActionResult(Result<UserDto> result)
    {
        if (result.IsSuccess)
            return Ok(result.Value);

        return Problem(title: result.Error, statusCode: result.StatusCode);
    }
}
