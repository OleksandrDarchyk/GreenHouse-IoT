using System.Text;
using api.Extensions;
using api.Services;
using DataAccess.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Mqtt.Controllers;
using NSwag;
using NSwag.Generation.Processors.Security;
using StateleSSE.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ── SSE backplane + EF realtime ───────────────────────────────────────────────
builder.Services.AddInMemorySseBackplane();
builder.Services.AddEfRealtime();

// ── Database (Neon.db / PostgreSQL) ──────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>((sp, opt) =>
{
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    opt.AddEfRealtimeInterceptor(sp);
});

// ── Services ─────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<ITokenService,    TokenService>();
builder.Services.AddScoped<IAuthService,     AuthService>();
builder.Services.AddHostedService<DeviceMonitorService>();
builder.Services.AddScoped<CommandService>();

// ── JWT ───────────────────────────────────────────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret is required.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        opt.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

// ── NSwag ─────────────────────────────────────────────────────────────────────
builder.Services.AddOpenApiDocument(config =>
{
    config.Title = "Greenhouse IoT API";
    config.AddSecurity("Bearer", new OpenApiSecurityScheme
    {
        Type        = OpenApiSecuritySchemeType.Http,
        Scheme      = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token"
    });
    config.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("Bearer"));
});

// ── CORS ──────────────────────────────────────────────────────────────────────
builder.Services.AddCors(opt =>
    opt.AddPolicy("Frontend", policy =>
    {
        var origins = (builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:5173,http://localhost:5174")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        policy.WithOrigins(origins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    }));

// MQTT Controllers with Flespi
builder.Services.AddMqttControllers();

var app = builder.Build();

// ── Auto-migrate on startup ───────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();

    app.GenerateApiClientsFromOpenApi(
            "../../client/src/api/generated/generated-ts-client.ts",
            "./openapi.json")
        .GetAwaiter()
        .GetResult();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── SSE endpoint ──────────────────────────────────────────────────────────────
app.MapGet("/sse", async (HttpContext ctx, ISseBackplane backplane, CancellationToken ct) =>
{
    await using var connection = backplane.CreateConnection();
    await using var stream = await ctx.OpenSseStreamAsync(cancellationToken: ct);
    await stream.WriteAsync(
        System.Text.Json.JsonSerializer.Serialize(new { connectionId = connection.ConnectionId }), ct);
    await foreach (var evt in connection.ReadAllAsync(ct))
        await stream.WriteAsync(evt.Group ?? "message", evt.Data, ct);
}).RequireCors("Frontend");

// Connect MQTT to Flespi
var mqttHost = builder.Configuration["Mqtt:Host"] ?? "mqtt.flespi.io";
var mqttPort = int.TryParse(builder.Configuration["Mqtt:Port"], out var p) ? p : 1883;

var flespiToken = builder.Configuration["Flespi:Token"]
                  ?? throw new InvalidOperationException("Flespi:Token is required.");

try
{
    var mqtt = app.Services.GetRequiredService<IMqttClientService>();

    await mqtt.ConnectAsync(
        host: mqttHost,
        port: mqttPort,
        username: flespiToken,
        password: "",
        useTls: false
    );

    app.Logger.LogInformation("MQTT connected to Flespi at {Host}:{Port}", mqttHost, mqttPort);
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "MQTT connect failed; MQTT subscriptions disabled.");
}

app.Run();
