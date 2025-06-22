const WEATHER_API_KEY = '45017ea56ecca68d10012b50cec53ea5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  pressure: number;
  time: string;
}

export const getWeatherByCity = async (cityName: string): Promise<WeatherData[]> => {
  try {
    const url = `${WEATHER_BASE_URL}/forecast?q=${cityName}&appid=${WEATHER_API_KEY}&units=metric`;
    console.log("API URL:", url); // בדיקה
    
    const response = await fetch(url);
    console.log("Response status:", response.status); // בדיקה
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText); // בדיקה
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("Weather API response:", data); // בדיקה
    
    return data.list.slice(0, 8).map((item: any) => ({
      temperature: Math.round(item.main.temp),
      pressure: item.main.pressure,
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }));
  } catch (error) {
    console.error('Error fetching weather:', error);
    return [];
  }
};