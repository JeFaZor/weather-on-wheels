using Microsoft.AspNetCore.Mvc;
using WeatherOnWheels.API.Models;
using WeatherOnWheels.API.Services;

namespace WeatherOnWheels.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaceController : ControllerBase
    {
        private readonly PlaceService _placeService;

        public PlaceController(PlaceService placeService)
        {
            _placeService = placeService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Place>>> GetPlaces()
        {
            var places = await _placeService.GetPlacesAsync();
            return Ok(places);
        }

        [HttpPost]
        public async Task<ActionResult<Place>> CreatePlace([FromBody] Place place)
        {
            place.CreatedAt = DateTime.UtcNow;
            var createdPlace = await _placeService.CreatePlaceAsync(place);
            return Ok(createdPlace);
        }
    }
}