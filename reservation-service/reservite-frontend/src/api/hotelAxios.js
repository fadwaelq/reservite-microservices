import axios from 'axios';

const hotelInstance = axios.create({
  baseURL: 'http://localhost:8084',  // Hotel Service
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

hotelInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default hotelInstance;