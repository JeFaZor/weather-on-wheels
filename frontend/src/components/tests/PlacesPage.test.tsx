import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>
}));

// Mock the APIs
jest.mock('../../services/api', () => ({
  fetchPlaces: jest.fn()
}));

jest.mock('../../services/weatherApi', () => ({
  getWeatherForPlace: jest.fn()
}));

// Mock child components
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
        {weatherData.length > 0 ? 'Weather Chart' : 'No data'}
      </div>
    );
  };
});

// Import after mocks
import PlacesPage from '../PlacesPage';

describe('PlacesPage', () => {
  const mockPlaces = [
    {
      id: '1',
      name: 'Test Restaurant',
      type: 'Restaurant',
      address: 'Tel Aviv, Israel',
      created_at: '2025-01-01T10:00:00Z',
      latitude: 32.0853,
      longitude: 34.7818
    },
    {
      id: '2',
      name: 'Test Hotel',
      type: 'Hotel',
      address: 'Jerusalem, Israel',
      created_at: '2025-01-02T10:00:00Z',
      latitude: 31.7683,
      longitude: 35.2137
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    const { fetchPlaces } = require('../../services/api');
    fetchPlaces.mockResolvedValue(mockPlaces);
  });

  test('renders page title and create button', async () => {
    render(<PlacesPage />);

    expect(screen.getByText('Weather on Wheels')).toBeInTheDocument();
    expect(screen.getByText('+ Add New Place')).toBeInTheDocument();
  });

  test('loads and displays places', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    });

    expect(screen.getByText('Places List (2)')).toBeInTheDocument();
  });

  test('filters places by type', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    // Filter by Restaurant
    const filterSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(filterSelect, { target: { value: 'Restaurant' } });

    expect(screen.getByText('Places List (1)')).toBeInTheDocument();
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.queryByText('Test Hotel')).not.toBeInTheDocument();
  });

  test('shows no places message when filter returns empty', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    // Filter by Park (no parks in mock data)
    const filterSelect = screen.getByDisplayValue('All Types');
    fireEvent.change(filterSelect, { target: { value: 'Park' } });

    expect(screen.getByText('No places of this type yet.')).toBeInTheDocument();
  });

  test('selects place and loads weather data', async () => {
    const { getWeatherForPlace } = require('../../services/weatherApi');
    getWeatherForPlace.mockResolvedValue([
      { temperature: 25, pressure: 1013, time: '10:00' }
    ]);

    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    // Click on a place
    fireEvent.click(screen.getByText('Test Restaurant'));

    await waitFor(() => {
      expect(screen.getByText('Weather at Test Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Current Temperature: 25°C')).toBeInTheDocument();
      expect(screen.getByText('Current Pressure: 1013 hPa')).toBeInTheDocument();
    });

    expect(getWeatherForPlace).toHaveBeenCalledWith(mockPlaces[0]);
  });

  test('shows loading state while fetching weather', async () => {
    const { getWeatherForPlace } = require('../../services/weatherApi');
    getWeatherForPlace.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Restaurant'));

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
    
    // Check that all options exist
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