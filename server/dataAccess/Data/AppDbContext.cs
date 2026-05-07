using dataAccess.Models;
using Microsoft.EntityFrameworkCore;
using DataAccess.Models;

namespace DataAccess.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ---------------- USER ----------------
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(u => u.Id);

            entity.Property(u => u.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();

            entity.Property(u => u.Email)
                .HasColumnName("email")
                .HasMaxLength(256)
                .IsRequired();

            entity.HasIndex(u => u.Email)
                .IsUnique();

            entity.Property(u => u.PasswordHash)
                .HasColumnName("password_hash")
                .IsRequired();

            entity.Property(u => u.Role)
                .HasColumnName("role")
                .HasMaxLength(50)
                .HasDefaultValue("Operator");

            entity.Property(u => u.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");

            entity.Property(u => u.LastLoginAt)
                .HasColumnName("last_login_at");

            entity.Property(u => u.IsActive)
                .HasColumnName("is_active")
                .HasDefaultValue(true);
        });
        
        // ---------------- SENSOR READING ----------------
        modelBuilder.Entity<SensorReading>(entity =>
        {
            entity.ToTable("sensor_readings");
            entity.HasKey(s => s.Id);

            entity.Property(s => s.Id)
                .HasColumnName("id")
                .UseIdentityAlwaysColumn();

            entity.Property(s => s.DeviceId)
                .HasColumnName("device_id")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(s => s.Temperature)
                .HasColumnName("temperature");

            entity.Property(s => s.Humidity)
                .HasColumnName("humidity");

            entity.Property(s => s.SoilMoisture)
                .HasColumnName("soil_moisture");

            entity.Property(s => s.AirQuality)
                .HasColumnName("air_quality");

            entity.Property(s => s.LightLevel)
                .HasColumnName("light_level");

            entity.Property(s => s.Timestamp)
                .HasColumnName("timestamp")
                .HasDefaultValueSql("NOW()");
        });
    }
}