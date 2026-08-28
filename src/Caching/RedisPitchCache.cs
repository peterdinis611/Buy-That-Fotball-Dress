using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace Caching;

public sealed class RedisPitchCache(
    IConnectionMultiplexer redis,
    IMemoryCache local,
    ILogger<RedisPitchCache> logger) : IPitchCache
{
    private static readonly JsonSerializerOptions Json = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly ConcurrentDictionary<string, SemaphoreSlim> gates = new();

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class
    {
        if (local.TryGetValue(key, out T? memory) && memory is not null)
            return memory;

        try
        {
            if (!redis.IsConnected)
                return null;

            var payload = await redis.GetDatabase().StringGetAsync(key);
            if (!payload.HasValue)
                return null;

            var value = JsonSerializer.Deserialize<T>(payload.ToString(), Json);
            if (value is not null)
                local.Set(key, value, TimeSpan.FromSeconds(20));

            return value;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis get failed for {Key}", key);
            return null;
        }
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        TimeSpan ttl,
        CancellationToken cancellationToken = default) where T : class
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null)
            return cached;

        var gate = gates.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync(cancellationToken);
        try
        {
            cached = await GetAsync<T>(key, cancellationToken);
            if (cached is not null)
                return cached;

            var value = await factory(cancellationToken);
            await SetAsync(key, value, ttl, cancellationToken);
            return value;
        }
        finally
        {
            gate.Release();
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken cancellationToken = default)
        where T : class
    {
        local.Set(key, value, TimeSpan.FromSeconds(Math.Min(30, ttl.TotalSeconds)));

        try
        {
            if (!redis.IsConnected)
                return;

            var payload = JsonSerializer.Serialize(value, Json);
            await redis.GetDatabase().StringSetAsync(key, payload, ttl);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis set failed for {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        local.Remove(key);

        try
        {
            if (!redis.IsConnected)
                return;

            await redis.GetDatabase().KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis delete failed for {Key}", key);
        }
    }

    public async Task<long> StampAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!redis.IsConnected)
                return 0;

            var value = await redis.GetDatabase().StringGetAsync(StampKey(name));
            return value.TryParse(out long stamp) ? stamp : 0;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis stamp read failed for {Name}", name);
            return 0;
        }
    }

    public async Task BumpAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            if (!redis.IsConnected)
                return;

            await redis.GetDatabase().StringIncrementAsync(StampKey(name));
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis stamp bump failed for {Name}", name);
        }
    }

    private static string StampKey(string name) => $"kv:stamp:{name}";
}
