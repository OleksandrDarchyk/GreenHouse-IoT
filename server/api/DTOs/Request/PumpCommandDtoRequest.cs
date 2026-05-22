using System.ComponentModel.DataAnnotations;

namespace api.DTOs.Request;

public class PumpCommandDtoRequest
{
    [Required(ErrorMessage = "State is required")]
    public string State { get; set; } = null!;
}
