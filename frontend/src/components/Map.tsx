import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Place {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

interface MapProps {
  places: Place[];
  selectedPlace: Place | null;
  onPlaceClick: (place: Place) => void;
}

const Map: React.FC<MapProps> = ({ places, selectedPlace, onPlaceClick }) => {
  const defaultPosition: [number, number] = [32.0853, 34.7818];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer 
        center={defaultPosition} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        {places.map((place, index) => {
          let position: [number, number];
          
          if (place.latitude && place.longitude) {
            position = [place.latitude, place.longitude];
          } else {
            position = [32.0853 + (index * 0.01), 34.7818 + (index * 0.01)];
          }

          return (
            <Marker
              key={place.id}
              position={position}
              eventHandlers={{
                click: () => onPlaceClick(place)
              }}
            >
              <Popup>
                <div>
                  <h3>{place.name}</h3>
                  <p>{place.type}</p>
                  <p>{place.address}</p>
                  {place.latitude && place.longitude && (
                    <small>Coordinates: {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}</small>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;