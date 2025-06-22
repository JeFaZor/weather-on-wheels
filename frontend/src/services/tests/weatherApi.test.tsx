import { getWeatherByCoordinates, getWeatherByCity, getWeatherForPlace } from '../weatherApi';

global.fetch = jest.fn();

describe('weatherApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getWeatherByCoordinates', () => {
    test('returns weather data for valid coordinates', async () => {
      const mockWeatherData = {
        list: [
          {
            main: { temp: 25.5, pressure: 1013 },
            dt: 1640995200
          },
          {
            main: { temp: 24.2, pressure: 1012 },
            dt: 1641001200
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const result = await getWeatherByCoordinates(32.0853, 34.7818);

      expect(result).toHaveLength(2);
      expect(result[0].temperature).toBe(26);
      expect(result[0].pressure).toBe(1013);
      expect(result[0].time).toBeDefined();
    });

    test('returns empty array on API error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await getWeatherByCoordinates(32.0853, 34.7818);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    test('returns empty array on network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await getWeatherByCoordinates(32.0853, 34.7818);

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getWeatherByCity', () => {
    test('returns weather data for valid city', async () => {
      const mockWeatherData = {
        list: [
          {
            main: { temp: 23.8, pressure: 1015 },
            dt: 1640995200
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const result = await getWeatherByCity('Tel Aviv');

      expect(result).toHaveLength(1);
      expect(result[0].temperature).toBe(24);
      expect(result[0].pressure).toBe(1015);
    });

    test('returns empty array on city not found', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await getWeatherByCity('NonExistentCity');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getWeatherForPlace', () => {
    test('uses coordinates when available', async () => {
      const mockWeatherData = {
        list: [
          {
            main: { temp: 26.0, pressure: 1010 },
            dt: 1640995200
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const place = {
        name: 'Test Place',
        latitude: 32.0853,
        longitude: 34.7818,
        address: 'Tel Aviv, Israel'
      };

      const result = await getWeatherForPlace(place);

      expect(result).toHaveLength(1);
      expect(result[0].temperature).toBe(26);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('lat=32.0853&lon=34.7818')
      );
    });

    test('falls back to Tel Aviv when no coordinates', async () => {
      const mockWeatherData = {
        list: [
          {
            main: { temp: 25.0, pressure: 1013 },
            dt: 1640995200
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const place = {
        name: 'Old Place',
        address: 'Some Address, Israel'
      };

      const result = await getWeatherForPlace(place);

      expect(result).toHaveLength(1);
      expect(result[0].temperature).toBe(25);
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=Tel%20Aviv')
      );
    });

    test('handles missing coordinates gracefully', async () => {
      const mockWeatherData = {
        list: [
          {
            main: { temp: 24.0, pressure: 1011 },
            dt: 1640995200
          }
        ]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherData
      });

      const place = {
        name: 'Place Without Coords',
        latitude: undefined,
        longitude: undefined,
        address: 'Some Address'
      };

      const result = await getWeatherForPlace(place);

      expect(result).toHaveLength(1);
      expect(result[0].temperature).toBe(24);
    });
  });
});