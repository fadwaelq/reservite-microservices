import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Container, Grid, Paper, Typography, Box, Button, Chip, Divider,
    List, ListItem, ListItemIcon, ListItemText, Avatar, CardMedia, CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CheckIcon from '@mui/icons-material/Check';
import BedIcon from '@mui/icons-material/Bed';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ReservationConfirmation = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth(); // Récupérer l'utilisateur de la session

    // On priorise les données passées par la navigation (création récente)
    // CORRECTION : Gestion de l'objet imbriqué data.reservation s'il existe
    const rawData = location.state?.reservation;
    const initialReservation = rawData?.reservation || rawData || null;

    const [reservation, setReservation] = useState(initialReservation);
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper secure pour les dates
    const safeDate = (dateStr) => {
        try {
            if (!dateStr) return new Date();
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? new Date() : d;
        } catch (e) {
            return new Date();
        }
    };

    useEffect(() => {
        // Chargement des détails de l'hôtel si on a une réservation
        const loadData = async () => {
            if (reservation && reservation.hotelId) {
                try {
                    const hotelData = await hotelService.getHotelById(reservation.hotelId);
                    setHotel(hotelData);
                } catch (error) {
                    console.error("Erreur chargement hôtel", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        loadData();
    }, [reservation]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    }

    if (!reservation) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5">Aucune réservation trouvée</Typography>
                <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>Retour à l'accueil</Button>
            </Container>
        );
    }

    // Données finales à afficher (Priorité : Réservation > Session Utilisateur > Défaut)
    const displayUser = {
        firstName: reservation.firstName || user?.firstName || 'Client',
        lastName: reservation.lastName || user?.lastName || '',
        email: reservation.email || user?.email || '',
        phone: reservation.phone || user?.phoneNumber || 'Non renseigné'
    };

    // Images de fallback si l'hôtel n'en a pas
    const hotelImage = hotel?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';

    return (
        <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    sx={{ mb: 3, color: 'text.primary', fontWeight: 'bold' }}
                >
                    RETOUR À L'ACCUEIL
                </Button>

                <Grid container spacing={4}>

                    {/* COLONNE GAUCHE : Carte Hôtel & Paiement */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 0, borderRadius: 3, overflow: 'hidden', mb: 3, bgcolor: 'white' }}>
                            <Box sx={{ position: 'relative' }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={hotelImage}
                                    alt="Hotel"
                                />
                                <Chip
                                    label="Confirmé"
                                    color="success"
                                    icon={<CheckCircleIcon />}
                                    sx={{
                                        position: 'absolute',
                                        top: 15,
                                        right: 15,
                                        bgcolor: 'white',
                                        color: 'success.main',
                                        fontWeight: 'bold',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                />
                            </Box>

                            <Box sx={{ p: 3 }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    {hotel?.name || "Nom de l'hôtel indisponible"}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, color: 'text.secondary' }}>
                                    <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: '#0071c2' }} />
                                    <Typography variant="body2">
                                        {hotel?.city || "Ville"}, {hotel?.address || "Adresse"}
                                    </Typography>
                                </Box>

                                <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, mb: 3 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Bien loué</Typography>
                                    <Typography variant="h6" sx={{ fontWeight: '600' }}>
                                        {reservation.roomType || "Chambre Standard"}
                                    </Typography>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body1" fontWeight="600">Total payé</Typography>
                                    <Typography variant="h4" color="primary" fontWeight="bold">
                                        {reservation.totalPrice}€
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: 'success.main', gap: 1 }}>
                                    <CreditCardIcon fontSize="small" />
                                    <Typography variant="caption" fontWeight="bold">
                                        Payé par carte bancaire
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Aide */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: '#e3f2fd', border: '1px solid #bbdefb' }}>
                            <Typography variant="subtitle2" gutterBottom sx={{ color: '#0d47a1', fontWeight: 'bold' }}>
                                Besoin d'aide ?
                            </Typography>
                            <Typography variant="body2" color="#1e88e5">
                                Contactez l'agence au <strong>01 23 45 67 89</strong> ou par email à support@travel.com
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* COLONNE DROITE : Détails complets */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ p: 5, borderRadius: 3, bgcolor: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', width: 50, height: 50, mr: 2 }}>
                                    <CheckIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" color="success.main" fontWeight="bold">
                                        RÉSERVATION CONFIRMÉE
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a1a1a' }}>
                                        {format(safeDate(reservation.checkIn), 'EEEE d MMMM yyyy', { locale: fr })}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        Arrivée prévue à partir de 14h00
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ mb: 4 }} />

                            <Grid container spacing={6}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Détails du séjour</Typography>

                                    <List disablePadding>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><BedIcon color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">Hébergement</Typography>}
                                                secondary={hotel?.name || 'Chargement...'}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><CheckCircleIcon color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">Chambre</Typography>}
                                                secondary={`N° ${reservation.roomId} - ${reservation.roomType || 'Standard'}`}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><CalendarMonthIcon color="primary" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">Dates</Typography>}
                                                secondary={`Du ${format(safeDate(reservation.checkIn), 'dd/MM/yyyy')} au ${format(safeDate(reservation.checkOut), 'dd/MM/yyyy')} `}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>Informations client</Typography>
                                    <List disablePadding>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon color="action" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">{displayUser.firstName} {displayUser.lastName}</Typography>}
                                                secondary="Client principal"
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><EmailIcon color="action" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">Email</Typography>}
                                                secondary={displayUser.email}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}><PhoneIcon color="action" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography fontWeight="500">Téléphone</Typography>}
                                                secondary={displayUser.phone}
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 5, bgcolor: '#f8f9fa', p: 3, borderRadius: 2, border: '1px dashed #dee2e6' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                                    Inclus dans votre réservation
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                            <Typography variant="body2">Paiement sécurisé par carte</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                            <Typography variant="body2">Confirmation immédiate</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                            <Typography variant="body2">Taxes et frais inclus</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <CheckIcon color="success" fontSize="small" />
                                            <Typography variant="body2">Service client 24/7</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
