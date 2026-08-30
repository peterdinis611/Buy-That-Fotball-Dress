using Contracts;
using IdentityService.DTOs;
using IdentityService.Entities;

namespace IdentityService.Mapping;

public static class UserMapper
{
    public static UserDto ToDto(this ApplicationUser user, string? token = null) => new()
    {
        Id = user.Id,
        Username = user.UserName ?? string.Empty,
        Email = user.Email ?? string.Empty,
        DisplayName = user.DisplayName,
        Token = token
    };

    public static UserCreated ToUserCreated(this ApplicationUser user) => new()
    {
        Id = user.Id,
        Username = user.UserName ?? string.Empty,
        Email = user.Email ?? string.Empty,
        DisplayName = user.DisplayName
    };
}
