using DataAccess.Models;

namespace api.DTOs;

public class CommandDto
{
    public Guid Id { get; set; }
    
    public string DeviceId { get; set; } = null!;
    
    public int UserId { get; set; }
    
    public DateTime Timestamp { get; set; } 
    
    public string Action { get; set; } = null!;
    
    public string Payload { get; set; } = "{}";
    
    public string Status { get; set; } = "Pending";
    // Pending, Sent, Completed, Failed
    
    public User User { get; set; } = null!;
}