using System.Text.Json.Serialization;
using Caching;
using FluentValidation;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using SearchService.Consumers;
using SearchService.Data;
using SearchService.Validation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<SearchQueryValidator>();

builder.Services.AddControllers(options =>
    {
        options.Filters.Add<FluentValidationFilter>();
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddDbContext<SearchDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IItemRepository, ItemRepository>();
builder.Services.AddPitchCache(builder.Configuration);

builder.Services.AddHttpClient("AuctionService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AuctionService:BaseUrl"] ?? "http://localhost:5025");
});

builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<AuctionCreatedConsumer>();
    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("search", false));

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "localhost", "/", h =>
        {
            h.Username(builder.Configuration["RabbitMq:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMq:Password"] ?? "guest");
        });

        cfg.UseMessageRetry(r =>
        {
            r.Interval(5, TimeSpan.FromSeconds(5));
            r.Ignore<ValidationException>();
        });
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddHostedService<SearchDbInitializer>();
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();
app.MapControllers();

app.Run();
