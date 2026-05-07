using System.Text.Json;
using api.DTOs;
using DataAccess.Data;
using dataAccess.Models;
using Mqtt.Controllers;

namespace api.Controllers;

public class GreenhouseMqttController(
    ILogger<GreenhouseMqttController> logger,
    AppDbContext db
) : MqttController
{
    [MqttRoute("greenhouse/smart-greenhouse/{deviceId}/sensor-data")]
    public async Task ListenSensorData(SensorReadingDTO msg, string deviceId)
    {
        logger.LogInformation("MQTT telemetry: {Json}", JsonSerializer.Serialize(msg));

        var entity = new SensorReading
        {
            DeviceId = deviceId,
            Temperature = msg.Temperature,
            Humidity = msg.Humidity,
            SoilMoisture = msg.SoilMoisture,
            AirQuality = msg.AirQuality,
            LightLevel = msg.LightLevel,
            Timestamp = DateTime.UtcNow
        };

        db.SensorReadings.Add(entity);
        await db.SaveChangesAsync();
    }
}