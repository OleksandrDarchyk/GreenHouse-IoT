namespace DataAccess.Models;

public class Command
{
    public Guid Id { get; set; } = Guid.NewGuid();
    
        public string DeviceId { get; set; } = null!;
    
        public int UserId { get; set; }
    
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
        public string Action { get; set; } = null!;
    
        public string Payload { get; set; } = "{}";
    
        public string Status { get; set; } = "Pending";
        // Pending, Sent, Completed, Failed
        // Pending   = saved in database, not sent yet
        // Sent      = successfully published to Flespi/MQTT
        // Completed = ESP32 confirmed it executed the command
        // Failed    = backend failed to publish, or device reported failure
    
        public User User { get; set; } = null!;
}