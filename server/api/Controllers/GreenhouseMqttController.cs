using System.Text.Json;
using api.DTOs;
using api.DTOs.Response;
using DataAccess.Data;
using DataAccess.Models;
using Mqtt.Controllers;

namespace api.Controllers;

public class GreenhouseMqttController(
    ILogger<GreenhouseMqttController> logger,
    AppDbContext db
) : MqttController
{
    [MqttRoute("greenhouse/smart-greenhouse/{deviceId}/sensor-data")]
    public async Task ListenSensorData(SensorReadingDtoResponse msg, string deviceId)
    {
        logger.LogInformation("MQTT telemetry: {Json}", JsonSerializer.Serialize(msg));

        var entity = new SensorReading
        {
            DeviceId              = deviceId,
            Temperature           = msg.Temperature,
            Humidity              = msg.Humidity,
            SoilMoisture          = msg.SoilMoisture,
            LightLevel            = msg.LightLevel,
            PumpOn                = msg.PumpOn,
            PumpState             = string.IsNullOrWhiteSpace(msg.PumpState) ? (msg.PumpOn ? "ON" : "OFF") : msg.PumpState,
            PumpAutoMode          = msg.PumpAutoMode,
            PumpMode              = string.IsNullOrWhiteSpace(msg.PumpMode)  ? "AUTO"                       : msg.PumpMode,
            FanOn                 = msg.FanOn,
            FanState              = string.IsNullOrWhiteSpace(msg.FanState)  ? (msg.FanOn  ? "ON" : "OFF") : msg.FanState,
            FanAutoMode           = msg.FanAutoMode,
            FanMode               = string.IsNullOrWhiteSpace(msg.FanMode)   ? "MANUAL"                    : msg.FanMode,
            SoilMoistureThreshold = msg.SoilMoistureThreshold,
            Timestamp             = DateTime.UtcNow
        };

        db.SensorReadings.Add(entity);
        await db.SaveChangesAsync();
    }
}