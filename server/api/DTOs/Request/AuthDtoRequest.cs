using System.ComponentModel.DataAnnotations;

namespace api.DTOs.Request;

public record RegisterRequest(
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Required, MinLength(8), MaxLength(128)]  string Password
);

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required]               string Password
);

