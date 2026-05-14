namespace api.DTOs;

public class AlertDto
{
    public Guid      Id         { get; set; }
    public string    DeviceId   { get; set; } = "";
    public string    Severity   { get; set; } = "";
    public string    Message    { get; set; } = "";
    public bool      IsResolved { get; set; }
    public DateTime  CreatedAt  { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
