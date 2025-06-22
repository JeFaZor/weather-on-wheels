using MongoDB.Driver;
using WeatherOnWheels.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB Configuration
var connectionString = builder.Configuration.GetConnectionString("MongoDB");
var mongoClient = new MongoClient(connectionString);
var database = mongoClient.GetDatabase("WeatherOnWheelsDB");

// Register MongoDB database
builder.Services.AddSingleton<IMongoDatabase>(database);

// Register our services
builder.Services.AddScoped<PlaceService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.MapControllers();

app.Run();