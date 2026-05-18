namespace api.DTOs;

public class SensorReadingDTO
{
    public Guid Id { get; set; }

    public string DeviceId { get; set; } = "";

    public double Temperature { get; set; }
    public double Humidity { get; set; }
    public double SoilMoisture { get; set; }
    public double AirQuality { get; set; }
    public double LightLevel { get; set; }

    public DateTime Timestamp { get; set; }
}
