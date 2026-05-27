using System.Security.Claims;
using api.DTOs.Request;
using api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CommandController : ControllerBase
{
    private readonly CommandService _commandService;

    public CommandController(CommandService commandService)
    {
        _commandService = commandService;
    }

    // POST /api/Command
    // Send command from frontend to ESP32 through backend + MQTT/Flespi
    [HttpPost]
    public async Task<IActionResult> SendCommand([FromBody] CommandDtoRequest dto)
    {
        if (dto is null)
            return BadRequest(new { error = "Command request is required" });

        if (string.IsNullOrWhiteSpace(dto.Action))
            return BadRequest(new { error = "Command action is required" });

        if (string.IsNullOrWhiteSpace(dto.DeviceId))
            return BadRequest(new { error = "Device ID is required" });

        var userIdRaw =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!int.TryParse(userIdRaw, out var userId))
            return Unauthorized(new { error = "Invalid user token" });

        var result = await _commandService.CreateAndSendCommand(dto, userId);

        if (result.Status == "Failed")
            return StatusCode(502, new { error = "Command saved but MQTT publish failed", command = result });

        return Ok(result);
    }

    // POST /api/devices/{deviceId}/commands/pump
    // Send pump on/off command to ESP32 via MQTT
    [HttpPost("~/api/devices/{deviceId}/commands/pump")]
    public async Task<IActionResult> SendPumpCommand(string deviceId, [FromBody] PumpCommandDtoRequest dto)
    {
        if (dto is null)
            return BadRequest(new { error = "Request body is required" });

        if (string.IsNullOrWhiteSpace(deviceId))
            return BadRequest(new { error = "Device ID is required" });

        if (string.IsNullOrWhiteSpace(dto.State))
            return BadRequest(new { error = "State is required" });

        var state = dto.State.Trim().ToLowerInvariant();
        if (state != "on" && state != "off")
            return BadRequest(new { error = "State must be \"on\" or \"off\"" });

        var userIdRaw =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!int.TryParse(userIdRaw, out var userId))
            return Unauthorized(new { error = "Invalid user token" });

        var commandRequest = new CommandDtoRequest
        {
            DeviceId = deviceId,
            Action   = "pump",
            Payload  = $"{{\"state\":\"{state}\"}}"
        };

        var result = await _commandService.CreateAndSendCommand(commandRequest, userId);

        if (result.Status == "Failed")
            return StatusCode(502, new
            {
                error   = "Command saved but MQTT publish failed",
                command = result
            });

        return Ok(new
        {
            deviceId  = result.DeviceId,
            action    = result.Action,
            state     = state,
            mqttTopic = $"greenhouse/smart-greenhouse/{result.DeviceId}/commands/pump",
            status    = result.Status
        });
    }
}