// src/pages/ReservationPage.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { Box, CircularProgress, Typography, Button } from '@mui/material';

export const ReservationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation } = location.state || {};

  useEffect(() => {
    if (!reservation) {
      navigate('/hotels');
      return;
    }

    const createPayPalOrder = async () => {
      try {
        const payment = await paymentService.createPayment(
          reservation.id,
          reservation.totalPrice
        );
        // Redirige vers PayPal
        window.location.href = payment.approvalUrl;
      } catch (err) {
        alert("Erreur paiement");
      }
    };

    createPayPalOrder();
  }, [reservation, navigate]);

  return (
    <Box sx={{ textAlign: 'center', mt: 10 }}>
      <CircularProgress size={60} />
      <Typography variant="h5" sx={{ mt: 3 }}>
        Redirection vers PayPal...
      </Typography>
    </Box>
  );
};