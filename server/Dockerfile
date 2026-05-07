FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["api/api.csproj", "api/"]
COPY ["dataAccess/dataAccess.csproj", "dataAccess/"]
RUN dotnet restore "api/api.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/api"
RUN dotnet publish "api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "api.dll"]