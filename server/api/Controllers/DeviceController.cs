using DataAccess.Data;
using DataAccess.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DeviceController(AppDbContext db) : ControllerBase
{
    private static readonly TimeSpan OfflineThreshold = TimeSpan.FromMinutes(2);

    // GET /api/Device/status — returns online/offline status per device
    [HttpGet("status")]
    public async Task<IActionResult> GetDeviceStatus()
    {
        var threshold = DateTime.UtcNow - OfflineThreshold;

        var statuses = await db.SensorReadings
            .AsNoTracking()
            .GroupBy(s => s.DeviceId)
            .Select(g => new
            {
                deviceId = g.Key,
                lastSeen = g.Max(s => s.Timestamp),
                isOnline = g.Max(s => s.Timestamp) >= threshold,
            })
            .ToListAsync();

        return Ok(statuses);
    }

    // GET /api/Device/overview — returns ESP32 online/offline + actuator states
    [HttpGet("overview")]
    public async Task<IActionResult> GetDeviceOverview()
    {
        var now = DateTime.UtcNow;

        var deviceIds = await db.SensorReadings
            .AsNoTracking()
            .Select(s => s.DeviceId)
            .Distinct()
            .ToListAsync();

        var result = new List<object>();

        foreach (var deviceId in deviceIds)
        {
            var latest = await db.SensorReadings
                .AsNoTracking()
                .Where(s => s.DeviceId == deviceId)
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync();

            if (latest is null) continue;

            var isOnline = (now - latest.Timestamp) < OfflineThreshold;

            result.Add(new
            {
                deviceId = latest.DeviceId,
                online   = isOnline,
                lastSeen = latest.Timestamp,
                actuators = new[]
                {
                    new
                    {
                        name         = "Water Pump",
                        type         = "pump",
                        state        = latest.PumpState,
                        on           = latest.PumpOn,
                        mode         = latest.PumpMode,
                        controllable = isOnline,
                    },
                    new
                    {
                        name         = "Fan",
                        type         = "fan",
                        state        = latest.FanState,
                        on           = latest.FanOn,
                        mode         = latest.FanMode,
                        controllable = isOnline,
                    },
                },
            });
        }

        return Ok(result);
    }

    // GET /api/Device/check — checks all devices and creates/resolves alerts
    [HttpGet("check")]
    public async Task<IActionResult> CheckDevices()
    {
        var deviceIds = await db.SensorReadings
            .AsNoTracking()
            .Select(s => s.DeviceId)
            .Distinct()
            .ToListAsync();

        var now = DateTime.UtcNow;

        foreach (var deviceId in deviceIds)
        {
            var latest = await db.SensorReadings
                .AsNoTracking()
                .Where(s => s.DeviceId == deviceId)
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync();

            if (latest is null) continue;

            var isOnline = (now - latest.Timestamp) < OfflineThreshold;

            if (!isOnline)
            {
                var hasAlert = await db.Alerts
                    .AnyAsync(a => a.DeviceId == deviceId && !a.IsResolved);

                if (!hasAlert)
                {
                    db.Alerts.Add(new Alert
                    {
                        DeviceId = deviceId,
                        Severity = "Critical",
                        Message  = $"Device {deviceId} is offline. Last seen: {latest.Timestamp:HH:mm:ss} UTC.",
                    });
                    await db.SaveChangesAsync();
                }
            }
            else
            {
                var openAlerts = await db.Alerts
                    .Where(a => a.DeviceId == deviceId && !a.IsResolved)
                    .ToListAsync();

                if (openAlerts.Count > 0)
                {
                    foreach (var alert in openAlerts)
                    {
                        alert.IsResolved = true;
                        alert.ResolvedAt = DateTime.UtcNow;
                    }
                    await db.SaveChangesAsync();
                }
            }
        }

        return Ok();
    }
}
