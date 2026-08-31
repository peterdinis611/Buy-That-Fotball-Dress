using EmailService.Consumers;
using EmailService.Post;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("IdentityService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["IdentityService:BaseUrl"] ?? "http://localhost:5028");
});
builder.Services.AddSingleton<ILetterSender, SmtpLetterSender>();

builder.Services.AddMassTransit(x =>
{
    x.AddConsumersFromNamespaceContaining<LetterRequestedConsumer>();
    x.SetEndpointNameFormatter(new KebabCaseEndpointNameFormatter("mail", false));

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMq:Host"] ?? "localhost", "/", h =>
        {
            h.Username(builder.Configuration["RabbitMq:Username"] ?? "guest");
            h.Password(builder.Configuration["RabbitMq:Password"] ?? "guest");
        });

        cfg.UseMessageRetry(r => r.Interval(5, TimeSpan.FromSeconds(5)));
        cfg.ConfigureEndpoints(context);
    });
});

builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/health", () => Results.Ok("KIT VAULT mail"));

app.Run();
