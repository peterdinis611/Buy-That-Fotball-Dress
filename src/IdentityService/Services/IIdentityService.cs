using IdentityService.Common;
using IdentityService.DTOs;

namespace IdentityService.Services;

public interface IIdentityService
{
    Task<Result<UserDto>> RegisterAsync(RegisterDto dto, CancellationToken cancellationToken);
    Task<Result<UserDto>> LoginAsync(LoginDto dto, CancellationToken cancellationToken);
    Task<Result<UserDto>> GetCurrentAsync(string userId, CancellationToken cancellationToken);
    Task<Result<UserDto>> GetByUsernameAsync(string username, CancellationToken cancellationToken);
    Task<IReadOnlyList<UserDto>> ListSquadAsync(CancellationToken cancellationToken);
}
