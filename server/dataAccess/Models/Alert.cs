namespace DataAccess.Models;

public class Alert
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string DeviceId { get; set; } = "";

    public string Severity { get; set; } = "Warning"; 
    // Info, Warning, Critical

    public string Message { get; set; } = "";

    public bool IsResolved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }
}