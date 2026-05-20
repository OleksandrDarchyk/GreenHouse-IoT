using api.DTOs.Request;
using api.DTOs.Response;
using DataAccess.Data;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Mqtt.Controllers;
using NLog.Targets;

namespace api.Services;

public class CommandService
{
    private readonly AppDbContext _db;
    private readonly ILogger<CommandService> _logger;
    private readonly IMqttClientService _mqtt;
    
    public CommandService (AppDbContext db, ILogger<CommandService> logger, IMqttClientService mqtt)
        {
        _db = db;
        _logger = logger;
        _mqtt = mqtt;
        }

    public async Task<CommandDtoResponse> CreateAndSendCommand(CommandDtoRequest commandRequest, int userId)
    {
        // Payload for MQTT — plain string ("on"/"off") as expected by ESP32
        var mqttPayload = commandRequest.Payload;

        // Create command entity for database.
        // Payload column is jsonb, so wrap the plain string in JSON quotes
        var command = new Command
        {
            DeviceId = commandRequest.DeviceId,
            UserId = userId,
            Timestamp = DateTime.UtcNow,
            Action = commandRequest.Action,
            Payload = $"\"{commandRequest.Payload}\"",
            Status = "Pending"
        };
        
        // Save command to database first
        _db.Commands.Add(command);
        await _db.SaveChangesAsync();
        
        // Build Mqtt topic — matches ESP32 subscription pattern
        var topic = $"greenhouse/smart-greenhouse/{command.DeviceId}/commands/{command.Action}";


        try
        {
            // Public command to Flespi Mqtt
            await _mqtt.PublishAsync(topic, mqttPayload);
            
            // If publish succeeds, update status
            command.Status = "Sent";
            await _db.SaveChangesAsync();
            
            _logger.LogInformation(
                "Command {CommandId} sent to MQTT topic {Topic}",
                command.Id,
                topic
            );
        } catch (Exception ex)
        {
            // If publish fails, update status
            command.Status = "Failed";
            await _db.SaveChangesAsync();
            _logger.LogError(
                ex,
                "Failed to send command {CommandId} to MQTT topic {Topic}",
                command.Id,
                topic
            );
        }
        
        // Get user email for response
        var userEmail = await _db.Users
            .Where(u => u.Id == command.UserId)
            .Select(u => u.Email)
            .FirstOrDefaultAsync();
        
        //  Return response DTO to frontend
        return new CommandDtoResponse
        {
            Id = command.Id,
            DeviceId = command.DeviceId,
            UserId = command.UserId,
            UserEmail = userEmail,
            Timestamp = command.Timestamp,
            Action = command.Action,
            Payload = command.Payload,
            Status = command.Status
        };
        
    }
}