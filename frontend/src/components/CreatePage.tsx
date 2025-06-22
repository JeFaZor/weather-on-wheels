import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import './CreatePage.css';
import { createPlace } from '../services/api';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMarkerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation: [number, number] | null;
}

// Component to handle map clicks
const LocationMarker: React.FC<LocationMarkerProps> = ({ onLocationSelect, selectedLocation }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return selectedLocation ? (
    <Marker position={selectedLocation} />
  ) : null;
};

const CreatePage = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Restaurant');
  const [address, setAddress] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle location selection from map
  const handleLocationSelect = async (lat: number, lng: number) => {
    setSelectedLocation([lat, lng]);
    
    // Get address from coordinates using reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error getting address:', error);
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if required fields are filled
    if (!name || !address) {
      alert('Please fill all required fields');
      return;
    }

    // Check name length
    if (name.length > 25) {
      alert('Name cannot be longer than 25 characters');
      return;
    }

    // Check if location is selected
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    setLoading(true);

    try {
      const placeData = {
        name,
        type,
        address,
        latitude: selectedLocation[0],
        longitude: selectedLocation[1]
      };
      
      await createPlace(placeData);
      alert('Place saved successfully!');
      
      // Clear form
      setName('');
      setAddress('');
      setType('Restaurant');
      setSelectedLocation(null);
      
      // Go back to places page
      navigate('/');
    } catch (error) {
      alert('Error saving place');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      <h1>Add New Place</h1>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Place Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              maxLength={25}
              placeholder="Enter place name"
              required
            />
            <small>{name.length}/25 characters</small>
          </div>

          <div className="field">
            <label>Place Type:</label>
            <select value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setType(e.target.value)}>
              <option value="Restaurant">Restaurant</option>
              <option value="Hotel">Hotel</option>
              <option value="Park">Park</option>
            </select>
          </div>

          <div className="field">
            <label>Location:</label>
            <div className="map-selection">
              <MapContainer
                center={[32.0853, 34.7818]}
                zoom={13}
                style={{ height: '300px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker 
                  onLocationSelect={handleLocationSelect}
                  selectedLocation={selectedLocation}
                />
              </MapContainer>
            </div>
            <small>Click on the map to select location</small>
          </div>

          <div className="field">
            <label>Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
              placeholder="Address will be filled automatically when you select location"
              required
            />
            <small>You can edit the address after selecting location</small>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Place'}
          </button>
        </form>

        <div className="back-link">
          <Link to="/" className="back-button">
            ← Back to Places List
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;