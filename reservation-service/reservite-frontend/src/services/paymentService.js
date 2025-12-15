import axios from 'axios';

// Payment Service - Port du payment-service
const PAYMENT_API_URL = 'http://localhost:8085';

const paymentAxios = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===> INTERCEPTEUR DÉSACTIVÉ TEMPORAIREMENT POUR ÉVITER LE 401 <===
// (Réactive-le plus tard quand tu auras un vrai JWT)
 /*
paymentAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
*/

export const paymentService = {
  /**
   * Créer un paiement PayPal
   */
  processPaymentAndReservation: async (paymentData) => {
    try {
      console.log('💳 Envoi au payment-service:', paymentData);
      console.log('💳 Payload complet:', JSON.stringify(paymentData, null, 2));

      const response = await paymentAxios.post('/api/payments', paymentData);
      console.log('✅ Paiement initié avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur paiement:', error.response?.data || error.message);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Request data:', JSON.stringify(paymentData));
      throw error;
    }
  },

  /**
   * Vérifier le statut d'un paiement (optionnel)
   */
  getPaymentStatus: async (paymentId) => {
    const response = await paymentAxios.get(`/api/payments/${paymentId}`);
    return response.data;
  }
};