using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

/// <summary>Authentication — register and login.</summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IAuthService   _auth;
    private readonly ITokenService  _tokens;
    private readonly IConfiguration _config;

    public AuthController(IAuthService auth, ITokenService tokens, IConfiguration config)
    {
        _auth   = auth;
        _tokens = tokens;
        _config = config;
    }

    /// <summary>Register a new user.</summary>
    /// <response code="201">User created, returns JWT.</response>
    /// <response code="409">Email already registered.</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        try
        {
            var user      = await _auth.RegisterAsync(req.Email, req.Password);
            var token     = _tokens.GenerateToken(user);
            var expiresIn = int.Parse(_config["Jwt:ExpiresInMinutes"] ?? "60") * 60;

            return CreatedAtAction(nameof(Register), BuildResponse(token, expiresIn, user));
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    /// <summary>Login with email and password.</summary>
    /// <response code="200">Returns JWT.</response>
    /// <response code="401">Invalid credentials.</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _auth.LoginAsync(req.Email, req.Password);

        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        var token     = _tokens.GenerateToken(user);
        var expiresIn = int.Parse(_config["Jwt:ExpiresInMinutes"] ?? "60") * 60;

        return Ok(BuildResponse(token, expiresIn, user));
    }

    private static AuthResponse BuildResponse(string token, int expiresIn, DataAccess.Models.User user) =>
        new(token, "Bearer", expiresIn, new UserDto(user.Id, user.Email, user.Role, user.CreatedAt));
}