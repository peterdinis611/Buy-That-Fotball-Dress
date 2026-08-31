namespace AdminService.Common;

public sealed class OfficeException(string message, int statusCode) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
}
