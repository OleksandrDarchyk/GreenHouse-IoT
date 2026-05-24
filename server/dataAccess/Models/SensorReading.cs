namespace DataAccess.Models;

public class SensorReading
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string DeviceId { get; set; } = "";

    public double Temperature { get; set; }      // °C
    public double Humidity { get; set; }         // %
    public double SoilMoisture { get; set; }     // %
    public double AirQuality { get; set; }       // PPM
    public double LightLevel { get; set; }       // lux

    // Actuator state snapshot received from ESP32 via MQTT
    public bool   PumpOn                { get; set; }
    public string PumpState             { get; set; } = "OFF";
    public bool   PumpAutoMode          { get; set; } = true;
    public string PumpMode              { get; set; } = "AUTO";

    public bool   FanOn                 { get; set; }
    public string FanState              { get; set; } = "OFF";
    public bool   FanAutoMode           { get; set; }
    public string FanMode               { get; set; } = "MANUAL";

    public int    SoilMoistureThreshold { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}