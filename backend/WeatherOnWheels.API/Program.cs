using MongoDB.Driver;
using WeatherOnWheels.API.Services;

var builder = WebApplication.CreateBuilder(args);

// services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB config
var connectionString = builder.Configuration.GetConnectionString("MongoDB");
var mongoClient = new MongoClient(connectionString);
var database = mongoClient.GetDatabase("WeatherOnWheelsDB");


builder.Services.AddSingleton<IMongoDatabase>(database);
builder.Services.AddScoped<PlaceService>();


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