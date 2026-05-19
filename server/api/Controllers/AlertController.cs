using api.DTOs;
using api.DTOs.Response;
using DataAccess.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertController(AppDbContext db) : ControllerBase
{
    // GET /api/Alert?take=50
    [HttpGet]
    public async Task<List<AlertDtoResponse>> GetAlerts(int take = 50)
    {
        take = Math.Clamp(take, 1, 200);

        return await db.Alerts
            .AsNoTracking()
            .OrderByDescending(a => a.CreatedAt)
            .Take(take)
            .Select(a => new AlertDtoResponse
            {
                Id         = a.Id,
                DeviceId   = a.DeviceId,
                Severity   = a.Severity,
                Message    = a.Message,
                IsResolved = a.IsResolved,
                CreatedAt  = a.CreatedAt,
                ResolvedAt = a.ResolvedAt,
            })
            .ToListAsync();
    }
}
