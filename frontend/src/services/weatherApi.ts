const WEATHER_API_KEY = '45017ea56ecca68d10012b50cec53ea5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  pressure: number;
  time: string;
}

interface Place {
  name?: string;
  latitude?: number;
  longitude?: number;
  address: string;
}

// Helper function to extract city name from address
const extractCityName = (address: string): string => {
  const parts = address.split(',').map(part => part.trim());
  
  // Look for actual city names (not numbers, not "District", etc.)
  for (const part of parts) {
    // Skip obvious non-city parts
    if (part && 
        !part.match(/^\d+$/) && // Skip pure numbers (postal codes)
        !part.toLowerCase().includes('district') &&
        !part.toLowerCase().includes('subdistrict') &&
        !part.toLowerCase().includes('israel') &&
        !part.toLowerCase().includes('street') &&
        !part.toLowerCase().includes('avenue') &&
        part.length > 2 && 
        part.length < 25) { // Cities aren't too long
      
      return part;
    }
  }
  
  // Last resort - first part
  return parts[0];
};

// Get weather using coordinates (preferred method)
export const getWeatherByCoordinates = async (lat: number, lng: number): Promise<WeatherData[]> => {
  try {
    const url = `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.list.slice(0, 8).map((item: any) => ({
      temperature: Math.round(item.main.temp),
      pressure: item.main.pressure,
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
    
  } catch (error) {
    console.error('Error fetching weather by coordinates:', error);
    return [];
  }
};

// Get weather using city name (fallback method)
export const getWeatherByCity = async (cityName: string): Promise<WeatherData[]> => {
  try {
    const cleanCityName = extractCityName(cityName);
    
    const url = `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(cleanCityName)}&appid=${WEATHER_API_KEY}&units=metric`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      // Try with simple fallback if extraction failed
      if (response.status === 404) {
        return getWeatherByCity('Tel Aviv');
      }
      
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.list.slice(0, 8).map((item: any) => ({
      temperature: Math.round(item.main.temp),
      pressure: item.main.pressure,
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
    
  } catch (error) {
    console.error('Error fetching weather by city:', error);
    return [];
  }
};

// Main function that tries coordinates first, then falls back to simple default
export const getWeatherForPlace = async (place: Place): Promise<WeatherData[]> => {
  // Try coordinates first if available (accurate and reliable!)
  if (place.latitude && place.longitude) {
    const result = await getWeatherByCoordinates(place.latitude, place.longitude);
    if (result.length > 0) {
      return result;
    }
  }
  
  // Simple fallback for old places without coordinates
  return getWeatherByCity('Tel Aviv');
};