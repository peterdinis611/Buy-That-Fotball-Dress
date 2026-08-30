using System.Collections.Concurrent;
using Caching;

namespace KitVault.Tests.Fakes;

public sealed class MemoryPitchCache : IPitchCache
{
    private readonly ConcurrentDictionary<string, object> store = new();
    private readonly ConcurrentDictionary<string, long> stamps = new();

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default) where T : class =>
        Task.FromResult(store.TryGetValue(key, out var value) ? value as T : null);

    public async Task<T> GetOrCreateAsync<T>(
        string key,
        Func<CancellationToken, Task<T>> factory,
        TimeSpan ttl,
        CancellationToken cancellationToken = default) where T : class
    {
        var cached = await GetAsync<T>(key, cancellationToken);
        if (cached is not null)
            return cached;

        var value = await factory(cancellationToken);
        await SetAsync(key, value, ttl, cancellationToken);
        return value;
    }

    public Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken cancellationToken = default)
        where T : class
    {
        store[key] = value!;
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        store.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task<long> StampAsync(string name, CancellationToken cancellationToken = default) =>
        Task.FromResult(stamps.GetValueOrDefault(name));

    public Task BumpAsync(string name, CancellationToken cancellationToken = default)
    {
        stamps.AddOrUpdate(name, 1, static (_, current) => current + 1);
        return Task.CompletedTask;
    }
}
