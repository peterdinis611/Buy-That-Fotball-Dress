using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace Caching;

public static class CacheServiceExtensions
{
    public static IServiceCollection AddPitchCache(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("Redis") ?? "localhost:6379";

        services.AddMemoryCache();
        services.AddSingleton<IConnectionMultiplexer>(_ =>
        {
            var options = ConfigurationOptions.Parse(connection);
            options.AbortOnConnectFail = false;
            options.ConnectRetry = 3;
            options.ConnectTimeout = 2500;
            options.ClientName = "kitvault";
            return ConnectionMultiplexer.Connect(options);
        });
        services.AddSingleton<IPitchCache, RedisPitchCache>();

        return services;
    }
}
