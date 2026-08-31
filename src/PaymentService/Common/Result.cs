namespace PaymentService.Common;

public class Result
{
    public bool IsSuccess { get; init; }
    public string? Error { get; init; }
    public int StatusCode { get; init; }

    public static Result Success() => new() { IsSuccess = true, StatusCode = StatusCodes.Status200OK };

    public static Result Fail(string error, int statusCode) => new()
    {
        Error = error,
        StatusCode = statusCode
    };

    public static Result NotFound(string error) => Fail(error, StatusCodes.Status404NotFound);
    public static Result Conflict(string error) => Fail(error, StatusCodes.Status409Conflict);
    public static Result BadRequest(string error) => Fail(error, StatusCodes.Status400BadRequest);
    public static Result Forbidden(string error) => Fail(error, StatusCodes.Status403Forbidden);
}

public sealed class Result<T> : Result
{
    public T? Value { get; init; }

    public static Result<T> Success(T value) => new()
    {
        IsSuccess = true,
        Value = value,
        StatusCode = StatusCodes.Status200OK
    };

    public static new Result<T> Fail(string error, int statusCode) => new()
    {
        Error = error,
        StatusCode = statusCode
    };

    public static new Result<T> NotFound(string error) => Fail(error, StatusCodes.Status404NotFound);
    public static new Result<T> Conflict(string error) => Fail(error, StatusCodes.Status409Conflict);
    public static new Result<T> BadRequest(string error) => Fail(error, StatusCodes.Status400BadRequest);
    public static new Result<T> Forbidden(string error) => Fail(error, StatusCodes.Status403Forbidden);
}
