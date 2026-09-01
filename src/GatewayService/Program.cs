var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        var origins = builder.Configuration.GetSection("ClientApps").Get<string[]>()
            ?? ["http://localhost:3000"];

        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .WithOrigins(origins);
    });
});

var app = builder.Build();

app.UseCors("frontend");
app.UseWebSockets();
app.MapReverseProxy();

app.Run();
