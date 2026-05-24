using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<SensorReading> SensorReadings => Set<SensorReading>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<Command> Commands => Set<Command>();

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
                .HasColumnName("id");

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

            entity.Property(s => s.PumpOn)
                .HasColumnName("pump_on")
                .HasDefaultValue(false);

            entity.Property(s => s.PumpState)
                .HasColumnName("pump_state")
                .HasMaxLength(10)
                .HasDefaultValue("OFF");

            entity.Property(s => s.PumpAutoMode)
                .HasColumnName("pump_auto_mode")
                .HasDefaultValue(true);

            entity.Property(s => s.PumpMode)
                .HasColumnName("pump_mode")
                .HasMaxLength(10)
                .HasDefaultValue("AUTO");

            entity.Property(s => s.FanOn)
                .HasColumnName("fan_on")
                .HasDefaultValue(false);

            entity.Property(s => s.FanState)
                .HasColumnName("fan_state")
                .HasMaxLength(10)
                .HasDefaultValue("OFF");

            entity.Property(s => s.FanAutoMode)
                .HasColumnName("fan_auto_mode")
                .HasDefaultValue(false);

            entity.Property(s => s.FanMode)
                .HasColumnName("fan_mode")
                .HasMaxLength(10)
                .HasDefaultValue("MANUAL");

            entity.Property(s => s.SoilMoistureThreshold)
                .HasColumnName("soil_moisture_threshold")
                .HasDefaultValue(30);

            entity.Property(s => s.Timestamp)
                .HasColumnName("timestamp")
                .HasDefaultValueSql("NOW()");
        });
        
        // ---------------- ALERT ----------------
        modelBuilder.Entity<Alert>(entity =>
        {
            entity.ToTable("alerts");
            entity.HasKey(a => a.Id);

            entity.Property(a => a.Id)
                .HasColumnName("id");

            entity.Property(a => a.DeviceId)
                .HasColumnName("device_id")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(a => a.Severity)
                .HasColumnName("severity")
                .HasMaxLength(50)
                .HasDefaultValue("Warning");

            entity.Property(a => a.Message)
                .HasColumnName("message")
                .IsRequired();

            entity.Property(a => a.IsResolved)
                .HasColumnName("is_resolved")
                .HasDefaultValue(false);

            entity.Property(a => a.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("NOW()");

            entity.Property(a => a.ResolvedAt)
                .HasColumnName("resolved_at");
        });
        
        // ---------------- COMMAND ----------------
        modelBuilder.Entity<Command>(entity =>
        {
            entity.ToTable("commands");
            entity.HasKey(c => c.Id);

            entity.Property(c => c.Id)
                .HasColumnName("id");

            entity.Property(c => c.DeviceId)
                .HasColumnName("device_id")
                .HasMaxLength(100)
                .IsRequired();
            
            entity.Property(c => c.UserId)
                .HasColumnName("user_id")
                .IsRequired();
            
            entity.Property(c => c.Timestamp)
                .HasColumnName("timestamp")
                .HasDefaultValueSql("NOW()");

            entity.Property(c => c.Action)
                .HasColumnName("action")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(c => c.Payload)
                .HasColumnName("payload")
                .HasColumnType("jsonb")
                .HasDefaultValueSql("'{}'::jsonb");

            entity.Property(c => c.Status)
                .HasColumnName("status")
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            entity.HasOne(c => c.User)
                .WithMany(u => u.Commands)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}