namespace api.DTOs.Request;

public class CommandDtoRequest
{
    public string DeviceId { get; set; } = null!;

    public string Action { get; set; } = null!;

    public string Payload { get; set; } = "{}";
}