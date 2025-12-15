import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservation, paymentAmount } = location.state || {};

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Paper elevation={3} sx={{ p: 6, borderRadius: 3 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />

        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
          Paiement réussi !
        </Typography>

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Votre réservation est confirmée
        </Typography>

        {paymentAmount && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Montant payé : <strong>{paymentAmount}€</strong>
          </Typography>
        )}

        {reservation && (
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Numéro de réservation
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              #{reservation.id}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Un email de confirmation a été envoyé à votre adresse.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate(`/reservation/${reservation?.id}/confirmation`, { state: { reservation } })}
            sx={{ bgcolor: '#0071c2' }}
          >
            Voir ma réservation
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/hotels')}
          >
            Retour aux hôtels
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};