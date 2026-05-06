using DataAccess.Data;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Services;

public interface IAuthService
{
    Task<User> RegisterAsync(string email, string password);
    Task<User?> LoginAsync(string email, string password);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext    _db;
    private readonly IPasswordService _passwords;

    public AuthService(AppDbContext db, IPasswordService passwords)
    {
        _db        = db;
        _passwords = passwords;
    }

    public async Task<User> RegisterAsync(string email, string password)
    {
        var exists = await _db.Users.AnyAsync(u => u.Email == email.ToLower());
        if (exists)
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Email        = email.ToLower().Trim(),
            PasswordHash = _passwords.Hash(password),
            Role         = "Operator",
            CreatedAt    = DateTime.UtcNow,
            IsActive     = true,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<User?> LoginAsync(string email, string password)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email.ToLower() && u.IsActive);

        if (user is null || !_passwords.Verify(password, user.PasswordHash))
            return null;

        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return user;
    }
}