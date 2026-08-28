using IdentityService.Common;
using IdentityService.DTOs;
using IdentityService.Entities;
using IdentityService.Mapping;
using Caching;
using Microsoft.AspNetCore.Identity;

namespace IdentityService.Services;

public sealed class IdentityAppService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IPitchCache cache) : IIdentityService
{
    public async Task<Result<UserDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken)
    {
        var username = dto.Username.Trim();
        var email = dto.Email.Trim();

        if (await userManager.FindByNameAsync(username) is not null)
            return Result<UserDto>.Conflict("That squad name is already on the sheet.");

        if (await userManager.FindByEmailAsync(email) is not null)
            return Result<UserDto>.Conflict("That email is already registered.");

        var user = new ApplicationUser
        {
            UserName = username,
            Email = email,
            DisplayName = string.IsNullOrWhiteSpace(dto.DisplayName) ? username : dto.DisplayName.Trim(),
            EmailConfirmed = true
        };

        var created = await userManager.CreateAsync(user, dto.Password);
        if (!created.Succeeded)
        {
            var error = string.Join(" ", created.Errors.Select(e => e.Description));
            return Result<UserDto>.BadRequest(error);
        }

        return Result<UserDto>.Success(user.ToDto(tokenService.CreateToken(user)));
    }

    public async Task<Result<UserDto>> LoginAsync(LoginDto dto, CancellationToken cancellationToken)
    {
        var login = dto.Username.Trim();
        var user = login.Contains('@')
            ? await userManager.FindByEmailAsync(login)
            : await userManager.FindByNameAsync(login);

        if (user is null || !await userManager.CheckPasswordAsync(user, dto.Password))
            return Result<UserDto>.Unauthorized("Wrong squad name or password.");

        return Result<UserDto>.Success(user.ToDto(tokenService.CreateToken(user)));
    }

    public async Task<Result<UserDto>> GetCurrentAsync(string userId, CancellationToken cancellationToken)
    {
        var key = CacheKeys.User(userId);
        var cached = await cache.GetAsync<UserDto>(key, cancellationToken);
        if (cached is not null)
            return Result<UserDto>.Success(cached);

        var user = await userManager.FindByIdAsync(userId);
        if (user is null)
            return Result<UserDto>.NotFound("Player not found.");

        var dto = user.ToDto();
        await cache.SetAsync(key, dto, CacheKeys.UserTtl, cancellationToken);
        return Result<UserDto>.Success(dto);
    }
}
