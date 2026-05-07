namespace dataAccess.Models;

public class SensorReading
{
    public int Id { get; set; }

    public string DeviceId { get; set; } = "greenhouse-01";

    public double Temperature { get; set; }      // °C
    public double Humidity { get; set; }         // %
    public double SoilMoisture { get; set; }     // %
    public double AirQuality { get; set; }       // PPM
    public double LightLevel { get; set; }       // lux

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}