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

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}