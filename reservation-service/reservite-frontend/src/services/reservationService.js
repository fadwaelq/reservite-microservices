// src/services/reservationService.js
import axios from '../api/axios';
import reservationAxios from '../api/reservationAxios';

export const reservationService = {
  createReservation: async (reservationData) => {
    const response = await reservationAxios.post('/api/reservations', reservationData);
    return response.data;
  },

  getMyReservations: async (userId) => {
    const response = await reservationAxios.get(`/api/reservations/user/${userId}`);
    return response.data;
  },

  cancelReservation: async (id) => {
    await reservationAxios.delete(`/api/reservations/${id}`);
  },

  getReservationById: async (id) => {
    const response = await reservationAxios.get(`/api/reservations/${id}`);
    return response.data;
  },

  getAllReservations: async () => {
    const response = await reservationAxios.get('/api/reservations');
    return response.data;
  },

  calculatePrice: (checkIn, checkOut, pricePerNight) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * pricePerNight : 0;
  }
};