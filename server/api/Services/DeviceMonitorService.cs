using DataAccess.Data;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class DeviceMonitorService(IServiceScopeFactory scopeFactory, ILogger<DeviceMonitorService> logger)
    : BackgroundService
{
    private static readonly TimeSpan Interval         = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan OfflineThreshold = TimeSpan.FromMinutes(2);

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        logger.LogInformation("DeviceMonitorService started.");

        while (!ct.IsCancellationRequested)
        {
            await Task.Delay(Interval, ct);
            try
            {
                await CheckDevicesAsync(ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Device check failed; will retry next interval.");
            }
        }
    }

    private async Task CheckDevicesAsync(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var db  = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var now = DateTime.UtcNow;

        var deviceIds = await db.SensorReadings
            .AsNoTracking()
            .Select(s => s.DeviceId)
            .Distinct()
            .ToListAsync(ct);

        foreach (var deviceId in deviceIds)
        {
            var latest = await db.SensorReadings
                .AsNoTracking()
                .Where(s => s.DeviceId == deviceId)
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync(ct);

            if (latest is null) continue;

            var isOnline = (now - latest.Timestamp) < OfflineThreshold;

            if (!isOnline)
            {
                var hasAlert = await db.Alerts
                    .AnyAsync(a => a.DeviceId == deviceId && !a.IsResolved, ct);

                if (!hasAlert)
                {
                    db.Alerts.Add(new Alert
                    {
                        DeviceId = deviceId,
                        Severity = "Critical",
                        Message  = $"Device {deviceId} is offline. Last seen: {latest.Timestamp:HH:mm:ss} UTC.",
                    });
                    await db.SaveChangesAsync(ct);
                    logger.LogWarning("Alert created: device {DeviceId} offline.", deviceId);
                }
            }
            else
            {
                var openAlerts = await db.Alerts
                    .Where(a => a.DeviceId == deviceId && !a.IsResolved)
                    .ToListAsync(ct);

                if (openAlerts.Count > 0)
                {
                    foreach (var alert in openAlerts)
                    {
                        alert.IsResolved = true;
                        alert.ResolvedAt = now;
                    }
                    await db.SaveChangesAsync(ct);
                    logger.LogInformation("Alerts resolved: device {DeviceId} back online.", deviceId);
                }
            }
        }
    }
}
