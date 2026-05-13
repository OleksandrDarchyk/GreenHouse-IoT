using NSwag.CodeGeneration.TypeScript;
using NSwag.Generation;

namespace api.Extensions;

public static class NSwagExtensions
{
    public static async Task GenerateApiClientsFromOpenApi(
        this WebApplication app,
        string tsOutputPath,
        string openApiJsonPath)
    {
        var generator = app.Services.GetRequiredService<IOpenApiDocumentGenerator>();
        var document = await generator.GenerateAsync("v1");

        var jsonPath = Path.GetFullPath(
            Path.Combine(Directory.GetCurrentDirectory(), openApiJsonPath));
        await File.WriteAllTextAsync(jsonPath, document.ToJson());

        var tsGenerator = new TypeScriptClientGenerator(document, new TypeScriptClientGeneratorSettings
        {
            Template                 = TypeScriptTemplate.Fetch,
            GenerateClientInterfaces = true,
        });

        var tsPath = Path.GetFullPath(
            Path.Combine(Directory.GetCurrentDirectory(), tsOutputPath));
        Directory.CreateDirectory(Path.GetDirectoryName(tsPath)!);
        await File.WriteAllTextAsync(tsPath, tsGenerator.GenerateFile());

        app.Logger.LogInformation("TypeScript client generated at {Path}", tsPath);
    }
}
