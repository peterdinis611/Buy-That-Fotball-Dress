using Caching;
using IdentityService.Common;
using IdentityService.DTOs;
using IdentityService.Entities;
using IdentityService.Mapping;
using MassTransit;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace IdentityService.Services;

public sealed class IdentityAppService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IPitchCache cache,
    IPublishEndpoint publishEndpoint) : IIdentityService
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

        await publishEndpoint.Publish(user.ToUserCreated(), cancellationToken);

        return Result<UserDto>.Success(await SheetAsync(user, withToken: true));
    }

    public async Task<Result<UserDto>> LoginAsync(LoginDto dto, CancellationToken cancellationToken)
    {
        var login = dto.Username.Trim();
        var user = login.Contains('@')
            ? await userManager.FindByEmailAsync(login)
            : await userManager.FindByNameAsync(login);

        if (user is null || !await userManager.CheckPasswordAsync(user, dto.Password))
            return Result<UserDto>.Unauthorized("Wrong squad name or password.");

        return Result<UserDto>.Success(await SheetAsync(user, withToken: true));
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

        var dto = await SheetAsync(user, withToken: false);
        await cache.SetAsync(key, dto, CacheKeys.UserTtl, cancellationToken);
        return Result<UserDto>.Success(dto);
    }

    public async Task<Result<UserDto>> GetByUsernameAsync(string username, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByNameAsync(username.Trim());
        if (user is null)
            return Result<UserDto>.NotFound("Player not found.");

        return Result<UserDto>.Success(await SheetAsync(user, withToken: false));
    }

    public async Task<IReadOnlyList<UserDto>> ListSquadAsync(CancellationToken cancellationToken)
    {
        var users = await userManager.Users
            .OrderBy(x => x.UserName)
            .ToListAsync(cancellationToken);

        var sheet = new List<UserDto>(users.Count);
        foreach (var user in users)
            sheet.Add(await SheetAsync(user, withToken: false));

        return sheet;
    }

    private async Task<UserDto> SheetAsync(ApplicationUser user, bool withToken)
    {
        var roles = await userManager.GetRolesAsync(user);
        var token = withToken ? await tokenService.CreateTokenAsync(user) : null;
        return user.ToDto(token, roles);
    }
}
