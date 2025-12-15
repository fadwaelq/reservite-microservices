import { useState, useEffect } from 'react';
import {
  Container, Typography, Card, CardContent, Button,
  Grid, Box, Alert, CircularProgress, Chip, Avatar,
  Paper, List, ListItem, ListItemIcon, ListItemText, Divider,
  TextField, InputAdornment, CardMedia
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { reservationService } from '../services/reservationService';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SearchIcon from '@mui/icons-material/Search';
import HotelIcon from '@mui/icons-material/Hotel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CancelIcon from '@mui/icons-material/Cancel';

export const MyReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [hotelsMap, setHotelsMap] = useState({}); // Cache pour les infos hôtels (id -> data)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // 1. Charger les réservations
      const resData = await reservationService.getMyReservations(user.id);

      // Si l'API retourne un objet avec une clé (ex: { content: [...] }), adapter ici
      const reservationList = Array.isArray(resData) ? resData : (resData.content || []);
      setReservations(reservationList);

      // 2. Charger les détails des hôtels uniques
      const uniqueHotelIds = [...new Set(reservationList.map(r => r.hotelId))];
      const hotelFetches = uniqueHotelIds.map(id => hotelService.getHotelById(id).then(h => ({ id, data: h })).catch(() => ({ id, data: null })));

      const hotelsData = await Promise.all(hotelFetches);
      const newHotelsMap = {};
      hotelsData.forEach(item => {
        if (item.data) newHotelsMap[item.id] = item.data;
      });
      setHotelsMap(newHotelsMap);

    } catch (err) {
      console.error("Erreur chargement dashboard", err);
      setError('Impossible de charger vos réservations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e, reservationId) => {
    e.stopPropagation(); // Empêcher le clic sur la carte
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }
    try {
      await reservationService.cancelReservation(reservationId);
      setSuccess('Réservation annulée avec succès');
      loadData(); // Recharger
    } catch (err) {
      setError('Erreur lors de l\'annulation');
    }
  };

  const handleCardClick = (reservation) => {
    // Naviguer vers la page de confirmation détaillée
    navigate(`/reservation/${reservation.id}/confirmation`, {
      state: { reservation }
    });
  };

  // --- RENDER HELPERS ---

  const SidebarItem = ({ icon, text, active }) => (
    <ListItem button sx={{
      borderRadius: 2,
      mb: 1,
      bgcolor: active ? '#e3f2fd' : 'transparent',
      color: active ? '#0071c2' : 'text.primary',
      '&:hover': { bgcolor: '#f5f5f5' }
    }}>
      <ListItemIcon sx={{ color: active ? '#0071c2' : 'inherit', minWidth: 40 }}>
        {icon}
      </ListItemIcon>
      <ListItemText primary={text} primaryTypographyProps={{ fontWeight: active ? 'bold' : 'normal' }} />
    </ListItem>
  );

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 5 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>

          {/* SIDEBAR GAUCHE */}
          <Grid item xs={12} md={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: 'white' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: '#0071c2', fontSize: 32 }}>
                  {user?.firstName?.charAt(0) || <PersonIcon />}
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Membre standard
                </Typography>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <List component="nav">
                <SidebarItem icon={<DashboardIcon />} text="Dashboard" />
                <SidebarItem icon={<PersonIcon />} text="Mon Profil" />
                <SidebarItem icon={<BookOnlineIcon />} text="Mes Réservations" active />
                <SidebarItem icon={<FavoriteIcon />} text="Favoris" />
                <SidebarItem icon={<CalendarMonthIcon />} text="Calendrier" />
              </List>
            </Paper>
          </Grid>

          {/* CONTENU PRINCIPAL */}
          <Grid item xs={12} md={9}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#1a1a1a', mb: 3 }}>
              Mes Réservations
            </Typography>

            {/* Barre de recherche */}
            <Paper component="form" elevation={0} sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', mb: 4, borderRadius: 2 }}>
              <TextField
                fullWidth
                placeholder="Rechercher une réservation..."
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', ml: 1 }} />
                    </InputAdornment>
                  ),
                  sx: { p: 1.5 }
                }}
              />
              <Button variant="contained" sx={{ m: 1, borderRadius: 2, bgcolor: '#6c5ce7', textTransform: 'none' }}>
                Rechercher
              </Button>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {reservations.length === 0 ? (
                <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
                  <Typography color="text.secondary">Aucune réservation trouvée.</Typography>
                </Paper>
              ) : (
                reservations.map((res) => {
                  const hotel = hotelsMap[res.hotelId];
                  const imageUrl = hotel?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';

                  return (
                    <Card
                      key={res.id || res.reservationId} // Fallback ID
                      elevation={0}
                      onClick={() => handleCardClick(res)}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        borderRadius: 3,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: '0.2s',
                        border: '1px solid #f0f0f0',
                        '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' }
                      }}
                    >
                      {/* Image Hotel */}
                      <CardMedia
                        component="img"
                        sx={{ width: { xs: '100%', sm: 250 }, height: { xs: 200, sm: 'auto' } }}
                        image={imageUrl}
                        alt={hotel?.name || 'Hotel'}
                      />

                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {hotel?.name || `Réservation #${res.id}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <HotelIcon fontSize="small" />
                              {hotel ? `${hotel.address}, ${hotel.city}` : 'Détails non disponibles'}
                            </Typography>
                          </Box>
                          <Chip
                            label={res.status || 'Confirmé'}
                            color={res.status === 'CANCELLED' ? 'error' : 'success'}
                            size="small"
                            variant="soft" // Note: material ui default usually contained/outlined, soft not default but harmless
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Arrivée</Typography>
                            <Typography variant="body2" fontWeight="500">
                              {format(new Date(res.checkIn), 'dd MMM yyyy', { locale: fr })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Départ</Typography>
                            <Typography variant="body2" fontWeight="500">
                              {format(new Date(res.checkOut), 'dd MMM yyyy', { locale: fr })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={4}>
                            <Typography variant="caption" color="text.secondary">Prix Total</Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {res.totalPrice}€
                            </Typography>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 'auto', display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<CancelIcon />}
                            onClick={(e) => handleCancel(e, res.id)}
                          >
                            Annuler
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => handleCardClick(res)}
                            sx={{ bgcolor: '#0071c2' }}
                          >
                            Voir détails
                          </Button>
                        </Box>
                      </Box>
                    </Card>
                  );
                })
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};