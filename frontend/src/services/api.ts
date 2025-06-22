
const API_URL = 'http://localhost:5249/api/place';

export const fetchPlaces = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const createPlace = async (place: any) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(place)
  });
  return response.json();
};