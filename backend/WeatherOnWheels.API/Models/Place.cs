using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace WeatherOnWheels.API.Models
{
    public class Place
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; } = "";

        [BsonElement("type")]
        public string Type { get; set; } = "";

        [BsonElement("address")]
        public string Address { get; set; } = "";

        [BsonElement("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}