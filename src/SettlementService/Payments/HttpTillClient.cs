using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using SettlementService.Common;
using SettlementService.DTOs;
using SettlementService.Entities;

namespace SettlementService.Payments;

public sealed class HttpTillClient(IHttpClientFactory http) : ITillClient
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public async Task<Result<TillCharge>> ChargeAsync(
        Settlement desk,
        string buyer,
        PayDeskDto? pay,
        CancellationToken cancellationToken)
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
                    playerName = desk.PlayerName,
                    sessionId = pay?.SessionId,
                    successUrl = pay?.SuccessUrl,
                    cancelUrl = pay?.CancelUrl
                },
                cancellationToken);
        }
        catch (HttpRequestException)
        {
            return Result<TillCharge>.Fail("The till is shut. Try again in a minute.", StatusCodes.Status503ServiceUnavailable);
        }
        catch (TaskCanceledException)
        {
            return Result<TillCharge>.Fail("The till did not answer. Try again in a minute.", StatusCodes.Status503ServiceUnavailable);
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadFromJsonAsync<TillSlip>(Json, cancellationToken);
                if (!string.IsNullOrWhiteSpace(body?.CheckoutUrl))
                    return Result<TillCharge>.Success(new TillCharge(null, body.CheckoutUrl));
                if (string.IsNullOrWhiteSpace(body?.Slip))
                    return Result<TillCharge>.Fail("The till did not stamp a slip.", StatusCodes.Status502BadGateway);
                return Result<TillCharge>.Success(new TillCharge(body.Slip, null));
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

            return Result<TillCharge>.Fail(title, (int)response.StatusCode);
        }
    }

    public async Task<Result<TillPayout>> ReleaseAsync(Settlement desk, CancellationToken cancellationToken)
    {
        var client = http.CreateClient("Payment");
        HttpResponseMessage response;
        try
        {
            response = await client.PostAsync($"/api/payments/{desk.Id}/release", null, cancellationToken);
        }
        catch (HttpRequestException)
        {
            return Result<TillPayout>.Fail("The till is shut. Try again in a minute.", StatusCodes.Status503ServiceUnavailable);
        }
        catch (TaskCanceledException)
        {
            return Result<TillPayout>.Fail("The till did not answer. Try again in a minute.", StatusCodes.Status503ServiceUnavailable);
        }

        using (response)
        {
            if (response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadFromJsonAsync<TillSlip>(Json, cancellationToken);
                if (string.IsNullOrWhiteSpace(body?.PayoutRef))
                    return Result<TillPayout>.Fail("The till did not pay the hammer.", StatusCodes.Status502BadGateway);
                return Result<TillPayout>.Success(new TillPayout(body.PayoutRef));
            }

            var title = "The till refused that payout.";
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

            return Result<TillPayout>.Fail(title, (int)response.StatusCode);
        }
    }

    private sealed class TillSlip
    {
        public string? Slip { get; set; }
        public string? PayoutRef { get; set; }
        public string? CheckoutUrl { get; set; }
    }

    private sealed class ProblemHint
    {
        public string? Title { get; set; }
    }
}
