namespace api.DTOs.Response;

public class AlertDtoResponse
{
    public Guid      Id         { get; set; }
    public string    DeviceId   { get; set; } = "";
    public string    Severity   { get; set; } = "";
    public string    Message    { get; set; } = "";
    public bool      IsResolved { get; set; }
    public DateTime  CreatedAt  { get; set; }
    public DateTime? ResolvedAt { get; set; }
}
