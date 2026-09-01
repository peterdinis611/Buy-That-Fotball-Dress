using AdminService.DTOs;

namespace AdminService.Services;

public interface IOfficeService
{
    Task<OfficeBoardDto> GetBoardAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<SquadCardDto>> GetSquadAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<PegCardDto>> GetPegsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<TillCardDto>> GetTillsAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<ClipMarkDto>> GetClipAsync(CancellationToken cancellationToken);
    Task ScratchPegAsync(Guid id, string steward, CancellationToken cancellationToken);
    Task VerifyPegAsync(Guid id, string steward, CancellationToken cancellationToken);
    Task WhistleTillAsync(Guid id, string steward, CancellationToken cancellationToken);
}
