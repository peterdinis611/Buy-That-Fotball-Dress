using System.Net.Http.Headers;

namespace AdminService.Services;

public sealed class ForwardAuthHandler(IHttpContextAccessor http) : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var header = http.HttpContext?.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrWhiteSpace(header)
            && request.Headers.Authorization is null
            && AuthenticationHeaderValue.TryParse(header, out var value))
        {
            request.Headers.Authorization = value;
        }

        return base.SendAsync(request, cancellationToken);
    }
}
