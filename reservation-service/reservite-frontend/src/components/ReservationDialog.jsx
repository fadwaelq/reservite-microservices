import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Typography,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export const ReservationDialog = ({ open, onClose, reservationData, onSubmit }) => {
    const { user } = useAuth(); // ✅ Récupérer l'utilisateur connecté

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialRequests: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ✅ Auto-remplir les champs avec les infos de l'utilisateur connecté
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || user.firstname || '',
                lastName: user.lastName || user.lastname || '',
                email: user.email || '',
                phone: user.phoneNumber || user.phone || ''
            }));
        }
    }, [user, open]); // Re-remplir quand le dialog s'ouvre

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit({
                ...formData,
                ...reservationData
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Erreur lors de la réservation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                Confirmer votre réservation
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* Résumé de la réservation */}
                    <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>Détails de la réservation</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Chambre</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {reservationData?.roomType}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Prix par nuit</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {reservationData?.pricePerNight}€
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Arrivée</Typography>
                                <Typography variant="body1">
                                    {reservationData?.checkIn ? format(new Date(reservationData.checkIn), 'dd/MM/yyyy') : ''}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">Départ</Typography>
                                <Typography variant="body1">
                                    {reservationData?.checkOut ? format(new Date(reservationData.checkOut), 'dd/MM/yyyy') : ''}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h6" color="primary">
                                    Total: {reservationData?.totalPrice}€
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Formulaire d'informations personnelles */}
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Vos informations
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Prénom"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Nom"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Téléphone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Demandes spéciales (optionnel)"
                                name="specialRequests"
                                value={formData.specialRequests}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ bgcolor: '#0071c2', px: 4 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Confirmer la réservation'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
