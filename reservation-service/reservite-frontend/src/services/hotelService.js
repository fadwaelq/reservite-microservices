import axios from 'axios';

// Instance axios pour le Hotel Service (PORT 8084)
const hotelAxios = axios.create({
  baseURL: 'http://localhost:8084',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

hotelAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const hotelService = {
  // Récupérer tous les hôtels (SANS FALLBACK MOCK)
  getAllHotels: async () => {
    const response = await hotelAxios.get('/api/hotels');
    console.log('✅ Hotels from DB:', response.data);
    return response.data;
  },

  getHotelById: async (id) => {
    const response = await hotelAxios.get(`/api/hotels/${id}`);
    return response.data;
  },

  getAvailableRooms: async (hotelId) => {
    const response = await hotelAxios.get(`/api/hotels/${hotelId}/rooms`);
    return response.data;
  }
};