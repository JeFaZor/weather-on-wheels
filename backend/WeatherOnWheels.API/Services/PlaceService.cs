using MongoDB.Driver;
using WeatherOnWheels.API.Models;

namespace WeatherOnWheels.API.Services
{
    public class PlaceService
    {
        private readonly IMongoCollection<Place> _places;

        public PlaceService(IMongoDatabase database)
        {
            _places = database.GetCollection<Place>("Places");
        }

        public async Task<List<Place>> GetPlacesAsync()
        {
            return await _places.Find(place => true).ToListAsync();
        }

        public async Task<Place> CreatePlaceAsync(Place place)
        {
            await _places.InsertOneAsync(place);
            return place;
        }
    }
}