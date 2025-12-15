// ============================================
// src/components/ReservationForm.jsx
// ============================================
import { useState } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { format, differenceInDays, addDays, isBefore, isAfter } from 'date-fns';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import HotelIcon from '@mui/icons-material/Hotel';
import EuroIcon from '@mui/icons-material/Euro';
import { reservationService } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ReservationForm = ({ hotel, selectedRoom, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  // Calcul du nombre de nuits
  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const nights = differenceInDays(
      new Date(formData.checkOut),
      new Date(formData.checkIn)
    );
    return nights > 0 ? nights : 0;
  };

  // Calcul du prix total
  const calculateTotalPrice = () => {
    const nights = calculateNights();
    return nights * (selectedRoom?.price || 0);
  };

  // Validation des dates
  const validateDates = () => {
    setValidationError('');

    if (!formData.checkIn || !formData.checkOut) {
      setValidationError('Veuillez sélectionner les dates');
      return false;
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifier que checkIn n'est pas dans le passé
    if (isBefore(checkIn, today)) {
      setValidationError("La date d'arrivée ne peut pas être dans le passé");
      return false;
    }

    // Vérifier que checkOut est après checkIn
    if (!isAfter(checkOut, checkIn)) {
      setValidationError("La date de départ doit être après la date d'arrivée");
      return false;
    }

    // Vérifier au moins 1 nuit
    const nights = calculateNights();
    if (nights < 1) {
      setValidationError('La réservation doit être d\'au moins 1 nuit');
      return false;
    }

    // Vérifier maximum 30 nuits
    if (nights > 30) {
      setValidationError('La réservation ne peut pas dépasser 30 nuits');
      return false;
    }

    return true;
  };

  // Gestion du changement de dates
  const handleDateChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setValidationError('');
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Vérifier l'authentification
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Valider les dates
    if (!validateDates()) {
      return;
    }

    // Vérifier qu'une chambre est sélectionnée
    if (!selectedRoom) {
      setError('Veuillez sélectionner une chambre');
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        userId: user.id,
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut
      };

      const reservation = await reservationService.createReservation(reservationData);

      // Callback de succès
      if (onSuccess) {
        onSuccess(reservation);
      } else {
        // Redirection par défaut vers les réservations
        navigate('/my-reservations');
      }
    } catch (err) {
      console.error('Erreur lors de la réservation:', err);
      setError(
        err.response?.data?.message ||
        'Erreur lors de la création de la réservation. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon />
          Réservation
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {validationError && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setValidationError('')}>
            {validationError}
          </Alert>
        )}

        {/* Informations de la sélection */}
        {hotel && selectedRoom && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <HotelIcon fontSize="small" />
              {hotel.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon fontSize="small" />
              Chambre {selectedRoom.roomNumber} - {selectedRoom.type}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <EuroIcon fontSize="small" />
              {selectedRoom.price}€ par nuit
            </Typography>
          </Box>
        )}

        {/* Formulaire */}
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date d'arrivée"
                type="date"
                value={formData.checkIn}
                onChange={(e) => handleDateChange('checkIn', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: format(new Date(), 'yyyy-MM-dd')
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date de départ"
                type="date"
                value={formData.checkOut}
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: formData.checkIn || format(new Date(), 'yyyy-MM-dd')
                }}
              />
            </Grid>
          </Grid>

          {/* Résumé de la réservation */}
          {nights > 0 && selectedRoom && (
            <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Résumé
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Durée du séjour
                </Typography>
                <Chip
                  label={`${nights} nuit${nights > 1 ? 's' : ''}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Prix par nuit
                </Typography>
                <Typography variant="body2">
                  {selectedRoom.price}€
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Sous-total
                </Typography>
                <Typography variant="body2">
                  {nights} × {selectedRoom.price}€ = {totalPrice}€
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Total
                </Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {totalPrice}€
                </Typography>
              </Box>
            </Box>
          )}

          {/* Bouton de soumission */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !selectedRoom || nights < 1}
            sx={{ mt: 3 }}
          >
            {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
          </Button>

          {!isAuthenticated() && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Vous devez être connecté pour effectuer une réservation
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;