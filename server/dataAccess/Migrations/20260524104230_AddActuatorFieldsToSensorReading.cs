using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace dataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddActuatorFieldsToSensorReading : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "fan_auto_mode",
                table: "sensor_readings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "fan_mode",
                table: "sensor_readings",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "MANUAL");

            migrationBuilder.AddColumn<bool>(
                name: "fan_on",
                table: "sensor_readings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "fan_state",
                table: "sensor_readings",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "OFF");

            migrationBuilder.AddColumn<bool>(
                name: "pump_auto_mode",
                table: "sensor_readings",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "pump_mode",
                table: "sensor_readings",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "AUTO");

            migrationBuilder.AddColumn<bool>(
                name: "pump_on",
                table: "sensor_readings",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "pump_state",
                table: "sensor_readings",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "OFF");

            migrationBuilder.AddColumn<int>(
                name: "soil_moisture_threshold",
                table: "sensor_readings",
                type: "integer",
                nullable: false,
                defaultValue: 30);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "fan_auto_mode",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "fan_mode",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "fan_on",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "fan_state",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "pump_auto_mode",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "pump_mode",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "pump_on",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "pump_state",
                table: "sensor_readings");

            migrationBuilder.DropColumn(
                name: "soil_moisture_threshold",
                table: "sensor_readings");
        }
    }
}
