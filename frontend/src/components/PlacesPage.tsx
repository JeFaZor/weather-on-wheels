import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPlaces } from '../services/api';
import { getWeatherForPlace, WeatherData } from '../services/weatherApi';
import Map from './Map';
import WeatherChart from './Weather';
import './PlacesPage.css';

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

const PlacesPage = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loadingWeather, setLoadingWeather] = useState(false);

  useEffect(() => {
    const loadPlaces = async () => {
      const data = await fetchPlaces();
      const sortedData = data.sort((a: Place, b: Place) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPlaces(sortedData);
    };
    loadPlaces();
  }, []);

  useEffect(() => {
    if (selectedPlace) {
      loadWeatherData(selectedPlace);
    }
  }, [selectedPlace]);

  const loadWeatherData = async (place: Place) => {
    setLoadingWeather(true);
    try {
      const weather = await getWeatherForPlace(place);
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to load weather data:', error);
      setWeatherData([]);
    } finally {
      setLoadingWeather(false);
    }
  };

  const filteredPlaces = filterType === 'all' 
    ? places 
    : places.filter(place => place.type === filterType);

  return (
    <div className="places-page">
      <div className="header">
        <h1>Weather on Wheels</h1>
        <Link to="/create" className="create-button">
          + Add New Place
        </Link>
      </div>
      
      <div className="container">
        <div className="places-list">
          <div className="places-header">
            <h2>Places List ({filteredPlaces.length})</h2>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Hotel">Hotel</option>
              <option value="Park">Park</option>
            </select>
          </div>

          {filteredPlaces.length === 0 ? (
            <p className="no-places">No places of this type yet.</p>
          ) : (
            filteredPlaces.map(place => (
              <div 
                key={place.id} 
                className={`place-item ${selectedPlace?.id === place.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlace(place)}
              >
                <h3>{place.name}</h3>
                <p className="place-type">{place.type}</p>
                <p>{place.address}</p>
                <small>Created: {new Date(place.created_at).toLocaleDateString('en-US')}</small>
                {place.latitude && place.longitude && (
                  <small style={{ display: 'block', color: '#4CAF50' }}>
                    📍 Exact location available
                  </small>
                )}
              </div>
            ))
          )}
        </div>

        <div className="map-area">
          <h2>Map</h2>
          <Map 
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onPlaceClick={setSelectedPlace}
          />
        </div>
      </div>

      {selectedPlace && (
        <div className="weather">
          <h3>Weather at {selectedPlace.name}</h3>
          {loadingWeather ? (
            <p>Loading weather data...</p>
          ) : weatherData.length > 0 ? (
            <div>
              <div className="current-weather">
                <p>Current Temperature: {weatherData[0].temperature}°C</p>
                <p>Current Pressure: {weatherData[0].pressure} hPa</p>
              </div>
              <WeatherChart weatherData={weatherData} />
            </div>
          ) : (
            <p>Weather data not available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacesPage;