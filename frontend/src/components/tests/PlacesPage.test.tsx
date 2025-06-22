import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

jest.mock('../../services/api', () => ({
  fetchPlaces: jest.fn()
}));

jest.mock('../../services/weatherApi', () => ({
  getWeatherForPlace: jest.fn()
}));

jest.mock('../Map', () => {
  return function MockMap({ places, onPlaceClick }: any) {
    return (
      <div data-testid="map-component">
        {places.map((place: any) => (
          <button
            key={place.id}
            data-testid={`map-place-${place.id}`}
            onClick={() => onPlaceClick(place)}
          >
            {place.name}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock('../Weather', () => {
  return function MockWeatherChart({ weatherData }: any) {
    return (
      <div data-testid="weather-chart">
        {weatherData.length > 0 ? 'Weather Chart' : 'No weather data'}
      </div>
    );
  };
});

import PlacesPage from '../PlacesPage';

const mockPlaces = [
  {
    id: '1',
    name: 'Test Restaurant',
    type: 'Restaurant',
    address: 'Tel Aviv, Israel',
    latitude: 32.0853,
    longitude: 34.7818,
    created_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Test Hotel',
    type: 'Hotel',
    address: 'Jerusalem, Israel',
    latitude: 31.7683,
    longitude: 35.2137,
    created_at: '2025-01-02T00:00:00.000Z'
  }
];

describe('PlacesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { fetchPlaces } = require('../../services/api');
    fetchPlaces.mockResolvedValue(mockPlaces);
  });

  test('renders page title and create button', () => {
    render(<PlacesPage />);
    
    expect(screen.getByText('Weather on Wheels')).toBeInTheDocument();
    expect(screen.getByText('+ Add New Place')).toBeInTheDocument();
  });

  test('loads and displays places', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Places List (2)')).toBeInTheDocument();
    });

    const restaurantElements = screen.getAllByText('Test Restaurant');
    expect(restaurantElements.length).toBeGreaterThan(0);
    
    const hotelElements = screen.getAllByText('Test Hotel');
    expect(hotelElements.length).toBeGreaterThan(0);
  });

  test('filters places by type', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Restaurant').length).toBeGreaterThan(0);
    });

    const filterSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(filterSelect, { target: { value: 'Restaurant' } });

    await waitFor(() => {
      expect(screen.getByText('Places List (1)')).toBeInTheDocument();
    });
  });

  test('shows no places message when filter returns empty', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Restaurant').length).toBeGreaterThan(0);
    });

    const filterSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(filterSelect, { target: { value: 'Park' } });

    await waitFor(() => {
      expect(screen.getByText('No places of this type yet.')).toBeInTheDocument();
    });
  });

  test('selects place and loads weather data', async () => {
    const { getWeatherForPlace } = require('../../services/weatherApi');
    getWeatherForPlace.mockResolvedValue([
      { temperature: 25, pressure: 1013, time: '10:00' }
    ]);

    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Restaurant').length).toBeGreaterThan(0);
    });

    const restaurantElements = screen.getAllByText('Test Restaurant');
    fireEvent.click(restaurantElements[0]);

    await waitFor(() => {
      expect(screen.getByText('Weather at Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Current Temperature: 25°C')).toBeInTheDocument();
      expect(screen.getByText('Current Pressure: 1013 hPa')).toBeInTheDocument();
    });

    expect(getWeatherForPlace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Restaurant',
        type: 'Restaurant'
      })
    );
  });

  test('shows loading state while fetching weather', async () => {
    const { getWeatherForPlace } = require('../../services/weatherApi');
    getWeatherForPlace.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Test Restaurant').length).toBeGreaterThan(0);
    });

    const restaurantElements = screen.getAllByText('Test Restaurant');
    fireEvent.click(restaurantElements[0]);

    expect(screen.getByText('Loading weather data...')).toBeInTheDocument();
  });

  test('renders map component with places', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByTestId('map-component')).toBeInTheDocument();
      expect(screen.getByTestId('map-place-1')).toBeInTheDocument();
      expect(screen.getByTestId('map-place-2')).toBeInTheDocument();
    });
  });

  test('displays filter dropdown with correct options', () => {
    render(<PlacesPage />);

    const filterSelect = screen.getByDisplayValue('All Types');
    expect(filterSelect).toBeInTheDocument();
    
    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
  });

  test('shows places count in header', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Places List (2)')).toBeInTheDocument();
    });
  });

  test('handles empty places list', async () => {
    const { fetchPlaces } = require('../../services/api');
    fetchPlaces.mockResolvedValue([]);

    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Places List (0)')).toBeInTheDocument();
    });
  });
});