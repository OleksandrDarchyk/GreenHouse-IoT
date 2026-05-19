namespace api.DTOs.Response;

public record AuthResponse(
    string AccessToken,
    string TokenType,
    int ExpiresIn,
    UserDto User
);

public record UserDto(
    int Id,
    string Email,
    string Role,
    DateTime CreatedAt
);