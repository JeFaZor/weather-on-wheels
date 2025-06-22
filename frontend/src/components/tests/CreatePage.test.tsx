import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock the API
jest.mock('../../services/api', () => ({
  createPlace: jest.fn().mockResolvedValue({})
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => jest.fn()
}));

// Mock leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: () => null
}));

// Mock leaflet
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {},
      mergeOptions: jest.fn()
    }
  }
}));

// Mock window.alert
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  writable: true,
  value: mockAlert
});

// Import after mocks
import CreatePage from '../CreatePage';

describe('CreatePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
  });

  test('renders form elements correctly', () => {
    render(<CreatePage />);
    
    expect(screen.getByText('Add New Place')).toBeInTheDocument();
    expect(screen.getByLabelText('Place Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Place Type:')).toBeInTheDocument();
    expect(screen.getByLabelText('Location:')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Place' })).toBeInTheDocument();
  });

  test('shows character count for place name', () => {
    render(<CreatePage />);
    
    const nameInput = screen.getByLabelText('Place Name:');
    fireEvent.change(nameInput, { target: { value: 'Test Restaurant' } });
    
    expect(screen.getByText('15/25 characters')).toBeInTheDocument();
  });

  test('validates name length', () => {
    render(<CreatePage />);
    
    const nameInput = screen.getByLabelText('Place Name:');
    const submitButton = screen.getByRole('button', { name: 'Save Place' });
    
    // Set a name longer than 25 characters
    fireEvent.change(nameInput, { target: { value: 'This is a very long restaurant name that exceeds the twenty five character limit' } });
    fireEvent.click(submitButton);
    
    expect(mockAlert).toHaveBeenCalledWith('Name cannot be longer than 25 characters');
  });

  test('validates required fields', () => {
    render(<CreatePage />);
    
    const submitButton = screen.getByRole('button', { name: 'Save Place' });
    fireEvent.click(submitButton);
    
    expect(mockAlert).toHaveBeenCalledWith('Please select a location on the map');
  });

  test('changes place type selection', () => {
    render(<CreatePage />);
    
    const typeSelect = screen.getByLabelText('Place Type:');
    fireEvent.change(typeSelect, { target: { value: 'Hotel' } });
    
    expect(typeSelect).toHaveValue('Hotel');
  });

  test('displays map component', () => {
    render(<CreatePage />);
    
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
  });

  test('name input respects maxLength attribute', () => {
    render(<CreatePage />);
    
    const nameInput = screen.getByLabelText('Place Name:') as HTMLInputElement;
    expect(nameInput.maxLength).toBe(25);
  });

  test('shows correct placeholder for address', () => {
    render(<CreatePage />);
    
    const addressInput = screen.getByLabelText('Address:');
    expect(addressInput).toHaveAttribute('placeholder', 'Address will be filled automatically when you select location');
  });
});