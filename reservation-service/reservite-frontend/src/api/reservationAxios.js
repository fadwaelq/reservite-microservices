// src/api/reservationAxios.js
import axios from 'axios';

const RESERVATION_API_URL = 'http://localhost:8082';

const reservationAxios = axios.create({
    baseURL: RESERVATION_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token
reservationAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default reservationAxios;
