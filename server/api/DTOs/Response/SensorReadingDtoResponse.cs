namespace api.DTOs.Response;

public class SensorReadingDtoResponse
{
    public Guid Id { get; set; }

    public string DeviceId { get; set; } = "";

    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public double SoilMoisture { get; set; }
    public double AirQuality { get; set; }
    public double LightLevel { get; set; }

    public DateTime Timestamp { get; set; }

    // Actuator state from ESP32 MQTT payload
    public bool   PumpOn               { get; set; }
    public string PumpState            { get; set; } = "";
    public bool   PumpAutoMode         { get; set; }
    public string PumpMode             { get; set; } = "";
    public bool   FanOn                { get; set; }
    public string FanState             { get; set; } = "";
    public bool   FanAutoMode          { get; set; }
    public string FanMode              { get; set; } = "";
    public int    SoilMoistureThreshold  { get; set; }
}
