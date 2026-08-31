using SettlementService.Common;
using SettlementService.Entities;
using SettlementService.Payments;

namespace KitVault.Tests.Fakes;

public sealed class FakeTillClient : ITillClient
{
    public int StatusCode { get; set; } = 200;
    public string? Error { get; set; }

    public Task<Result<string>> ChargeAsync(Settlement desk, string buyer, CancellationToken cancellationToken)
    {
        if (StatusCode != 200)
            return Task.FromResult(Result<string>.Fail(Error ?? "The till is shut.", StatusCode));

        var slip = $"TILL-{desk.Id.ToString("N")[..8].ToUpperInvariant()}";
        return Task.FromResult(Result<string>.Success(slip));
    }
}
