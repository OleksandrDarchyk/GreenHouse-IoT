using DataAccess.Models;

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
    
        public User User { get; set; } = null!;
}