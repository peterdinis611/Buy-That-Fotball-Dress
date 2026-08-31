using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using SettlementService.Common;
using SettlementService.Entities;

namespace SettlementService.Payments;

public sealed class HttpTillClient(IHttpClientFactory http) : ITillClient
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public async Task<Result<string>> ChargeAsync(Settlement desk, string buyer, CancellationToken cancellationToken)
    {
        var client = http.CreateClient("Payment");
        HttpResponseMessage response;
        try
        {
            response = await client.PostAsJsonAsync(
                $"/api/payments/{desk.Id}/charge",
                new
                {
                    auctionId = desk.AuctionId,
                    seller = desk.Seller,
                    buyer,
                    amount = desk.Amount,
                    club = desk.Club,
                    playerName = desk.PlayerName
                },
                cancellationToken);
        }
        catch (HttpRequestException)
        {
            return Result<string>.Fail("The till is shut. Try again in a minute.", StatusCodes.Status503ServiceUnavailable);
        }
        catch (TaskCanceledException)
        {
            return Result<string>.Fail("The till did not answer. Try again in a minute.", StatusCodes.Status503ServiceUnavailable);
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadFromJsonAsync<TillSlip>(Json, cancellationToken);
                if (string.IsNullOrWhiteSpace(body?.Slip))
                    return Result<string>.Fail("The till did not stamp a slip.", StatusCodes.Status502BadGateway);
                return Result<string>.Success(body.Slip);
            }

            var title = "The till refused that charge.";
            try
            {
                var hint = await response.Content.ReadFromJsonAsync<ProblemHint>(Json, cancellationToken);
                if (!string.IsNullOrWhiteSpace(hint?.Title))
                    title = hint.Title;
            }
            catch
            {
                // keep fallback
            }

            return Result<string>.Fail(title, (int)response.StatusCode);
        }
    }

    private sealed class TillSlip
    {
        public string? Slip { get; set; }
    }

    private sealed class ProblemHint
    {
        public string? Title { get; set; }
    }
}
