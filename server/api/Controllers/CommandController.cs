using api.DTOs.Request;
using api.Services;
using DataAccess.Data;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
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
    [Authorize]
    public async Task<IActionResult> SendCommand([FromBody] CommandDtoRequest dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Action))
        return BadRequest(new { error = "Command action is required" });

        if (string.IsNullOrWhiteSpace(dto.DeviceId))
        return BadRequest(new { error = "Device ID is required" });

        var userIdRaw =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!int.TryParse(userIdRaw, out var userId))
            return Unauthorized();
        
        var result = await _commandService.CreateAndSendCommand(dto, userId);

        return Ok(result);
        
    }
}