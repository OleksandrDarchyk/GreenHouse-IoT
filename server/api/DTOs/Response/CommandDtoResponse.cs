using DataAccess.Models;

namespace api.DTOs.Response;

public class CommandDtoResponse
{
    public Guid Id { get; set; }

    public string DeviceId { get; set; } = null!;

    public int UserId { get; set; }

    public string? UserEmail { get; set; }

    public DateTime Timestamp { get; set; }

    public string Action { get; set; } = null!;

    public string Payload { get; set; } = "{}";

    public string Status { get; set; } = "Pending";
}