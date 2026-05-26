using api.DTOs.Response;
using DataAccess.Data;
using DataAccess.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.EfRealtime;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SensorReadingController(
    ISseBackplane backplane,
    IRealtimeManager realtimeManager,
    AppDbContext db
) : RealtimeControllerBase(backplane)
{
    // Initial sensor data snapshot for chart/list
    // GET /api/SensorReading/GetSensorReadings
    [HttpGet(nameof(GetSensorReadings))]
    public async Task<List<SensorReadingDtoResponse>> GetSensorReadings(
        string? deviceId,
        int take = 100,
        DateTime? from = null,
        DateTime? to = null)
    {
        take = Math.Clamp(take, 1, 2000);

        var q = db.SensorReadings.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(deviceId))
            q = q.Where(s => s.DeviceId == deviceId);

        if (from.HasValue)
            q = q.Where(s => s.Timestamp >= from.Value);

        if (to.HasValue)
            q = q.Where(s => s.Timestamp <= to.Value);

        var latest = await q
            .OrderByDescending(s => s.Timestamp)
            .Take(take)
            .Select(s => new SensorReadingDtoResponse
            {
                Id = s.Id,
                DeviceId = s.DeviceId,
                Temperature = s.Temperature,
                Humidity = s.Humidity,
                SoilMoisture = s.SoilMoisture,
                LightLevel = s.LightLevel,
                Timestamp = s.Timestamp
            })
            .ToListAsync();

        return latest
            .OrderBy(s => s.Timestamp)
            .ToList();
    }

    // Live latest sensor reading for SSE
    // GET /api/SensorReading/GetSensorReadingLatest
    [HttpGet(nameof(GetSensorReadingLatest))]
    public async Task<RealtimeListenResponse<SensorReadingDtoResponse?>> GetSensorReadingLatest(
        string connectionId,
        string? deviceId)
    {
        var group = $"sensor-reading:latest:{deviceId ?? "all"}";

        await backplane.Groups.AddToGroupAsync(connectionId, group);

        realtimeManager.Subscribe<AppDbContext>(
            connectionId,
            group,
            criteria: snap => snap.HasChanges<SensorReading>(),
            query: async ctx =>
            {
                var q = ctx.SensorReadings.AsNoTracking();

                if (!string.IsNullOrWhiteSpace(deviceId))
                    q = q.Where(s => s.DeviceId == deviceId);

                return await q
                    .OrderByDescending(s => s.Timestamp)
                    .Select(s => new SensorReadingDtoResponse
                    {
                        Id = s.Id,
                        DeviceId = s.DeviceId,
                        Temperature = s.Temperature,
                        Humidity = s.Humidity,
                        SoilMoisture = s.SoilMoisture,
                        LightLevel = s.LightLevel,
                        Timestamp = s.Timestamp
                    })
                    .FirstOrDefaultAsync();
            });

        var initialQ = db.SensorReadings.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(deviceId))
            initialQ = initialQ.Where(s => s.DeviceId == deviceId);

        var initial = await initialQ
            .OrderByDescending(s => s.Timestamp)
            .Select(s => new SensorReadingDtoResponse
            {
                Id = s.Id,
                DeviceId = s.DeviceId,
                Temperature = s.Temperature,
                Humidity = s.Humidity,
                SoilMoisture = s.SoilMoisture,
                LightLevel = s.LightLevel,
                Timestamp = s.Timestamp
            })
            .FirstOrDefaultAsync();

        return new RealtimeListenResponse<SensorReadingDtoResponse?>(group, initial);
    }
}