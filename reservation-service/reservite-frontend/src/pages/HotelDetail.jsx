import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Grid, Card, CardContent, Button,
  Box, Rating, CircularProgress, Alert, TextField, CardMedia, Chip, Paper, Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import BedIcon from '@mui/icons-material/Bed';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import PoolIcon from '@mui/icons-material/Pool';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import BalconyIcon from '@mui/icons-material/Balcony';
import SpaIcon from '@mui/icons-material/Spa';
import WifiIcon from '@mui/icons-material/Wifi';
import BathtubIcon from '@mui/icons-material/Bathtub';
import SmokeFreeIcon from '@mui/icons-material/SmokeFree';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DeckIcon from '@mui/icons-material/Deck';
import LocalBarIcon from '@mui/icons-material/LocalBar';

import { hotelService } from '../services/hotelService';
import { reservationService } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import { format, addDays } from 'date-fns';
import { ReservationDialog } from '../components/ReservationDialog';

const Amenities = () => {
  const items = [
    { icon: <PoolIcon />, label: '3 piscines' },
    { icon: <LocalDiningIcon />, label: 'Bon petit-déjeuner' },
    { icon: <LocalParkingIcon />, label: 'Parking sur place gratuit' },
    { icon: <LocalDiningIcon />, label: '3 restaurants' },
    { icon: <BalconyIcon />, label: 'Balcon' },
    { icon: <SpaIcon />, label: 'Spa et centre de bien-être' },
    { icon: <WifiIcon />, label: 'Connexion Wi-Fi gratuite' },
    { icon: <BathtubIcon />, label: 'Salle de bains privative' },
    { icon: <SmokeFreeIcon />, label: 'Chambres non-fumeurs' },
    { icon: <AcUnitIcon />, label: 'Climatisation' },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={index}>
          <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
            <Box sx={{ mr: 2, color: 'text.secondary', display: 'flex' }}>{item.icon}</Box>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>{item.label}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd')
  });
  const [imageError, setImageError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // State pour les réservations (pour vérifier dispo)
  const [allReservations, setAllReservations] = useState([]);

  useEffect(() => {
    loadHotelDetails();
    loadReservations();
  }, [id]);

  const loadReservations = async () => {
    try {
      // Charger toutes les réservations pour vérifier les conflits de dates
      // (Idéalement, on aurait un endpoint backend filtré par Hotel + Dates)
      const data = await reservationService.getAllReservations();
      // Filtrer pour cet hôtel uniquement
      const hotelRes = Array.isArray(data) ? data.filter(r => r.hotelId === parseInt(id) && r.status !== 'CANCELLED') : [];
      setAllReservations(hotelRes);
    } catch (err) {
      console.error("Erreur chargement réservations", err);
    }
  };

  const loadHotelDetails = async () => {
    try {
      const hotelData = await hotelService.getHotelById(id);
      const roomsData = await hotelService.getAvailableRooms(id);

      console.log('🏨 Hotel data loaded:', hotelData);
      console.log('🛏️ Rooms data loaded:', roomsData);
      console.log('🛏️ First room structure:', roomsData[0]);

      setHotel(hotelData);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      console.error('Error loading hotel details:', err);
      setError('Erreur lors du chargement des détails');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };



  // Vérifier si une chambre est disponible pour les dates sélectionnées
  const isRoomAvailable = (room) => {
    // 1. Si la chambre est "globally" indisponible (flag base de données)
    if (room.available === false) return false;

    // 2. Vérifier les conflits de dates avec les réservations existantes
    if (!bookingData.checkIn || !bookingData.checkOut) return true;

    const userCheckIn = new Date(bookingData.checkIn).getTime();
    const userCheckOut = new Date(bookingData.checkOut).getTime();

    // Rechercher un conflit
    const conflict = allReservations.find(res => {
      // Même chambre ?
      // Note: On compare roomId. Parfois l'API retourne des formats différents, donc on sécurise.
      const resRoomId = res.roomId || res.room_id;
      if (resRoomId != room.id && resRoomId != room.roomId) return false;

      const resCheckIn = new Date(res.checkIn).getTime();
      const resCheckOut = new Date(res.checkOut).getTime();

      // Logique d'intersection de dates :
      // (StartA <= EndB) and (EndA >= StartB)
      return (userCheckIn < resCheckOut && userCheckOut > resCheckIn);
    });

    return !conflict; // Si conflit trouvé, pas disponible
  };

  const handleRoomSelect = (room) => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    setSelectedRoom(room);
  };

  const calculateTotalPrice = () => {
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) return 0;
    return reservationService.calculatePrice(
      bookingData.checkIn,
      bookingData.checkOut,
      selectedRoom.price
    );
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const nights = Math.ceil(
      (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24)
    );
    return nights > 0 ? nights : 0;
  };

  const handleBooking = () => {
    if (!selectedRoom || !bookingData.checkIn || !bookingData.checkOut) {
      setError('Veuillez sélectionner des dates valides');
      return;
    }
    if (bookingData.checkIn >= bookingData.checkOut) {
      setError('La date de départ doit être après la date d arrivée');
      return;
    }
    // Open dialog instead of submitting directly
    setDialogOpen(true);
  };

  const handleReservationSubmit = async (formData) => {
    console.log('🎯 handleReservationSubmit called!');
    console.log('🎯 formData:', formData);
    console.log('🎯 selectedRoom:', selectedRoom);

    try {
      // 🔍 DEBUG: Vérifier les données de la chambre sélectionnée
      console.log('🔍 DEBUG selectedRoom:', selectedRoom);
      console.log('🔍 selectedRoom.id:', selectedRoom.id);
      console.log('🔍 selectedRoom.roomId:', selectedRoom.roomId);
      console.log('🔍 selectedRoom.roomNumber:', selectedRoom.roomNumber);
      console.log('🔍 Type de selectedRoom.id:', typeof selectedRoom.id);

      // 🔧 FIX: Utiliser le bon champ pour l'ID de la chambre
      // Si le backend renvoie roomId au lieu de id, ou si id contient roomNumber
      let actualRoomId = selectedRoom.roomId || selectedRoom.id;

      // Si l'id est en fait le roomNumber (comme "102"), chercher le vrai ID
      if (typeof actualRoomId === 'string' || actualRoomId > 100) {
        console.warn('⚠️ selectedRoom.id semble être roomNumber, recherche du vrai ID...');
        // Essayer de trouver l'index de la chambre dans le tableau
        const roomIndex = rooms.findIndex(r => r.roomNumber === selectedRoom.roomNumber);
        if (roomIndex !== -1) {
          actualRoomId = roomIndex + 1; // ID basé sur l'index (temporaire)
          console.log('🔧 Using calculated ID:', actualRoomId);
        }
      }

      // ⚠️ Check if user ID is present
      if (!user?.id) {
        console.error('❌ User ID missing from context:', user);
        confirm('Erreur: Session utilisateur incomplète. Veuillez vous déconnecter et vous reconnecter.') && navigate('/login');
        return;
      }

      const reservationPayload = {
        userId: user?.id,
        hotelId: parseInt(id),
        roomId: actualRoomId,  // ✅ Utiliser l'ID corrigé
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        // Ajouter les infos pour la page de paiement
        roomType: selectedRoom?.type,
        pricePerNight: selectedRoom?.price,
        totalPrice: calculateTotalPrice(),
        nights: calculateNights()
      };

      console.log('📤 Navigating to payment page with data:', reservationPayload);

      // Rediriger vers la page de paiement au lieu de créer la réservation
      setDialogOpen(false);
      navigate('/payment', { state: { reservationData: reservationPayload } });

    } catch (err) {
      console.error('❌ Reservation error:', err);
      console.error('❌ Error details:', err.response?.data);
      throw new Error(err.response?.data?.message || 'Erreur lors de la réservation');
    }
  };

  const getHotelImage = (hotel) => {
    if (imageError || !hotel) return null;
    if (hotel.imageUrl) return hotel.imageUrl;
    const fallbackImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&h=400&fit=crop'
    ];
    return fallbackImages[hotel.id % fallbackImages.length];
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '60vh', alignItems: 'center' }}><CircularProgress /></Box>;
  if (!hotel) return <Container sx={{ mt: 4 }}><Alert severity="error">Hôtel non trouvé</Alert><Button onClick={() => navigate('/hotels')} sx={{ mt: 2 }}>Retour aux hôtels</Button></Container>;

  const imageUrl = getHotelImage(hotel);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Amenities Grid */}
      <Amenities />

      {/* Main Layout */}
      <Grid container spacing={4}>
        {/* Left Column: Description */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
              {hotel.description || "L'établissement Hotel vous accueille pour un séjour mémorable. Il comprend une piscine extérieure, une salle de sport, un jardin et un parking privé gratuit. De nombreux équipements et services sont fournis sur place, notamment un restaurant."}
            </Typography>
            <Typography variant="body1" paragraph>
              L'établissement propose des hébergements dotés de la climatisation, d'un bureau, d'un coffre-fort, d'une télévision, d'un balcon ainsi que d'une salle de bains privative pourvue d'un bidet.
            </Typography>
            <Typography variant="body1" paragraph>
              Un petit-déjeuner buffet est servi sur place.
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Ses points forts
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <PoolIcon sx={{ mr: 1 }} /> 3 piscines
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <WifiIcon sx={{ mr: 1 }} /> Connexion Wi-Fi gratuite
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <SpaIcon sx={{ mr: 1 }} /> Spa et centre de bien-être
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <LocalParkingIcon sx={{ mr: 1 }} /> Parking gratuit
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <LocalDiningIcon sx={{ mr: 1 }} /> 3 restaurants
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <FitnessCenterIcon sx={{ mr: 1 }} /> Centre de remise en forme
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <SmokeFreeIcon sx={{ mr: 1 }} /> Chambres non-fumeurs
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#008009' }}>
              <LocalBarIcon sx={{ mr: 1 }} /> Bar
            </Box>
          </Box>
        </Grid>

        {/* Right Column: Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ bgcolor: '#ebf3ff', p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Points forts de l'établissement
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <LocationOnIcon fontSize="small" />
              <Typography variant="body2">
                <strong>Bonne situation géographique :</strong> très bien notée par de récents voyageurs (8,1)
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mt: 2 }}>
              Infos concernant le petit-déjeuner
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>Buffet</Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocalParkingIcon fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2">Parking privé gratuit à l'hôtel</Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={() => {
                const element = document.getElementById('rooms-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{ bgcolor: '#0071c2', fontWeight: 'bold', textTransform: 'none' }}
            >
              Réserver
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }} id="rooms-section">
        Chambres Disponibles
      </Typography>

      {/* Date Selection */}
      <Card sx={{ mb: 4, p: 3, bgcolor: '#fffae3', border: '1px solid #febb02' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              label="Date d'arrivée"
              type="date"
              value={bookingData.checkIn}
              onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <TextField
              label="Date de départ"
              type="date"
              value={bookingData.checkOut}
              onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: bookingData.checkIn || format(new Date(), 'yyyy-MM-dd') }}
              sx={{ bgcolor: 'white' }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {calculateNights()} nuit(s)
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Rooms List */}
      <Grid container spacing={3}>
        {rooms.map((room) => {
          const available = isRoomAvailable(room);

          return (
            <Grid item xs={12} md={6} key={room.id}>
              <Card variant="outlined" sx={{ height: '100%', borderColor: '#e7e7e7', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <BedIcon sx={{ mr: 1 }} /> Chambre {room.roomNumber}
                    </Typography>
                    {available ? (
                      <Chip
                        label="Disponible"
                        size="small"
                        sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 'bold', borderRadius: 1 }}
                        icon={<CheckCircleIcon sx={{ '&&': { color: 'white' } }} />}
                      />
                    ) : (
                      <Chip
                        label="Indisponible"
                        size="small"
                        color="error"
                        sx={{ fontWeight: 'bold', borderRadius: 1 }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    {room.type}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography>Capacité: {room.capacity} personne(s)</Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {room.description || "Suite traditionnelle avec décoration soignée et équipements modernes."}
                  </Typography>

                  <Typography variant="h4" sx={{ color: available ? '#0071c2' : 'text.disabled', fontWeight: 'bold', mb: 2 }}>
                    {room.price}€ / nuit
                  </Typography>

                  <Button
                    variant={available ? "outlined" : "contained"}
                    fullWidth
                    disabled={!available}
                    sx={{
                      color: available ? '#0071c2' : 'white',
                      borderColor: '#0071c2',
                      bgcolor: available ? 'transparent' : '#e0e0e0',
                      fontWeight: 'bold',
                      '&:hover': { bgcolor: available ? '#f0f7fa' : '#e0e0e0' }
                    }}
                    onClick={() => handleRoomSelect(room)}
                  >
                    {available ? "SÉLECTIONNER CETTE CHAMBRE" : "NON DISPONIBLE"}
                  </Button>
                </Box>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Booking Summary */}
      {selectedRoom && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'white',
            borderTop: '1px solid #ddd',
            p: 2
          }}
        >
          <Container maxWidth="lg">
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h6">
                  Réservation: {selectedRoom.type} ({calculateNights()} nuits)
                </Typography>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  Total: {calculateTotalPrice()}€
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleBooking}
                  sx={{ bgcolor: '#0071c2', px: 4, py: 1.5, fontWeight: 'bold' }}
                >
                  Confirmer la réservation
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Paper>
      )}
      {/* Spacer for fixed footer */}
      {selectedRoom && <Box sx={{ height: 100 }} />}

      {/* Reservation Dialog */}
      <ReservationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        reservationData={{
          roomType: selectedRoom?.type,
          pricePerNight: selectedRoom?.price,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          totalPrice: calculateTotalPrice(),
          nights: calculateNights()
        }}
        onSubmit={handleReservationSubmit}
      />
    </Container>
  );
};