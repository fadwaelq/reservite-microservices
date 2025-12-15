import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Box,
    TextField,
    Alert,
    CircularProgress,
    Divider,
    Paper
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WifiIcon from '@mui/icons-material/Wifi';
import { paymentService } from '../services/paymentService';
import { reservationService } from '../services/reservationService';

export const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const reservationData = location.state?.reservationData;

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Rediriger si pas de données de réservation
    if (!reservationData) {
        navigate('/hotels');
        return null;
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Formater le numéro de carte (espaces tous les 4 chiffres)
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) return; // Max 16 chiffres + 3 espaces
        }

        // Formater la date d'expiration (MM/YY)
        if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
            if (formattedValue.length > 5) return;
        }

        // Limiter CVV à 3 chiffres
        if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setPaymentInfo({ ...paymentInfo, [name]: formattedValue });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        console.log('🔍 DEBUG: reservationData reçu:', reservationData);
        console.log('🔍 DEBUG: reservationData.userId:', reservationData?.userId);
        console.log('🔍 DEBUG: reservationData.totalPrice:', reservationData?.totalPrice);

        try {
            // ÉTAPE 1 : Créer la réservation avec statut PENDING
            console.log('📝 Création de la réservation (statut PENDING)...');
            console.log('📤 Données de réservation:', {
                userId: reservationData.userId,
                hotelId: reservationData.hotelId,
                roomId: reservationData.roomId,
                checkIn: reservationData.checkIn,
                checkOut: reservationData.checkOut,
                firstName: reservationData.firstName,
                lastName: reservationData.lastName,
                email: reservationData.email,
                phone: reservationData.phone,
                specialRequests: reservationData.specialRequests,
                totalPrice: reservationData.totalPrice
            });

            const reservationResponse = await reservationService.createReservation({
                userId: reservationData.userId,
                hotelId: reservationData.hotelId,
                roomId: reservationData.roomId,
                checkIn: reservationData.checkIn,
                checkOut: reservationData.checkOut,
                firstName: reservationData.firstName,
                lastName: reservationData.lastName,
                email: reservationData.email,
                phone: reservationData.phone,
                specialRequests: reservationData.specialRequests,
                totalPrice: reservationData.totalPrice
            });

            console.log('✅ Réservation créée:', reservationResponse);
            console.log('🔍 Type de réponse:', typeof reservationResponse);
            console.log('🔍 Clés de la réponse:', Object.keys(reservationResponse));
            console.log('🔍 reservationResponse.id:', reservationResponse.id);
            console.log('🔍 reservationResponse.reservationId:', reservationResponse.reservationId);

            const reservationId = reservationResponse.id || reservationResponse.reservationId;
            console.log('🔍 ID extrait:', reservationId);
            console.log('🔍 Type de l\'ID:', typeof reservationId);

            if (!reservationId) {
                throw new Error('Réservation créée mais aucun ID retourné');
            }

            // ÉTAPE 2 : Simuler le traitement du paiement (2 secondes)
            console.log('💳 Traitement du paiement...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ÉTAPE 3 : Créer le paiement PayPal
            console.log('💳 Création du paiement PayPal...');

            // Ensure we have valid numeric values (backend expects Long and Double)
            const numericReservationId = Number(reservationId);
            const numericAmount = Number(reservationData.totalPrice);

            console.log('🔍 Validation payment data:');
            console.log('   - reservationId:', numericReservationId, '(type:', typeof numericReservationId, ')');
            console.log('   - amount:', numericAmount, '(type:', typeof numericAmount, ')');

            if (!numericReservationId || isNaN(numericReservationId)) {
                throw new Error(`ID de réservation invalide: ${reservationId}`);
            }
            if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
                throw new Error(`Montant invalide: ${reservationData.totalPrice}`);
            }

            const paymentPayload = {
                reservationId: numericReservationId,
                amount: numericAmount
            };

            console.log('📤 Données de paiement:', paymentPayload);
            const paymentResponse = await paymentService.processPaymentAndReservation(paymentPayload);

            console.log('✅ Paiement créé:', paymentResponse);

            // ÉTAPE 4 : Rediriger vers PayPal ou page de succès
            if (paymentResponse.approvalUrl) {
                // Rediriger vers PayPal pour validation
                window.location.href = paymentResponse.approvalUrl;
            } else {
                // Paiement simulé réussi, rediriger vers succès
                navigate('/payment/success', {
                    state: {
                        reservation: reservationResponse,
                        payment: paymentResponse,
                        paymentAmount: reservationData.totalPrice
                    }
                });
            }
        } catch (err) {
            console.error('❌ Erreur:', err);
            console.error('❌ Détails:', err.response?.data);
            setError(err.response?.data?.message || err.message || 'Erreur lors du paiement');
            setProcessing(false);
        }
    };

    // Helper pour générer l'année (les 10 prochaines années)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>

            {/* Stepper simulé (visuel uniquement pour matcher le design) */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6, color: 'text.secondary', gap: 4 }}>
                <Typography variant="body2">Main page</Typography>
                <Typography variant="body2">Shipping details</Typography>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', borderBottom: '2px solid #0071c2' }}>
                    Payment method
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 4,
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* 🎨 GAUCHE: Carte Bancaire Visuelle */}
                <Box sx={{
                    position: 'relative',
                    width: 320,
                    height: 200,
                    mb: { xs: 4, md: 0 }
                }}>
                    {/* Shadow Card (l'effet de pile derrière) */}
                    <Box sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(0,0,0,0.1)',
                        borderRadius: '16px',
                        zIndex: 0
                    }} />

                    {/* Carte Principale Bleue */}
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, #0071c2 0%, #00a2ff 100%)',
                        borderRadius: '16px',
                        color: 'white',
                        p: 3,
                        boxShadow: '0 10px 20px rgba(0, 113, 194, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        zIndex: 1
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', opacity: 0.8 }}>BANK</Typography>
                            <Box sx={{ transform: 'rotate(90deg)' }}>
                                <WifiIcon />
                            </Box>
                        </Box>

                        <Box sx={{ pl: 1 }}>
                            {/* Puce */}
                            <Box sx={{
                                width: 40,
                                height: 30,
                                bgcolor: '#ffd93b',
                                borderRadius: '4px',
                                mb: 2,
                                border: '1px solid rgba(0,0,0,0.1)'
                            }} />

                            {/* Numéro de carte */}
                            <Typography variant="h5" sx={{ fontFamily: 'monospace', letterSpacing: 2, mb: 1, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                                {paymentInfo.cardNumber || '•••• •••• •••• ••••'}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <Box>
                                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem' }}>CARDHOLDER NAME</Typography>
                                    <Typography variant="body2" sx={{ textTransform: 'uppercase', fontFamily: 'monospace' }}>
                                        {paymentInfo.cardHolder || 'NOM DU TITULAIRE'}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem' }}>EXPIRES</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                        {paymentInfo.expiryDate || 'MM/YY'}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* 📝 DROITE: Formulaire Blanc */}
                <Paper elevation={0} sx={{
                    flex: 1,
                    p: 4,
                    borderRadius: 2,
                    maxWidth: 450,
                    bgcolor: 'white',
                    filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.05))'
                }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        Payment Details
                    </Typography>

                    <form onSubmit={handlePayment}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 1 }}>CARD NUMBER</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="cardNumber"
                                    value={paymentInfo.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    required
                                    InputProps={{
                                        sx: { bgcolor: '#f8f9fa' },
                                        endAdornment: <Box component="img" src="https://img.icons8.com/color/48/mastercard.png" sx={{ width: 24, opacity: 0.7 }} />
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 1 }}>CARDHOLDER NAME</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="cardHolder"
                                    value={paymentInfo.cardHolder}
                                    onChange={handleInputChange}
                                    required
                                    InputProps={{ sx: { bgcolor: '#f8f9fa' } }}
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 1 }}>MONTH</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    name="expiryMonth" // Note: need to handle this in state or reuse input logic
                                    value={paymentInfo.expiryDate.split('/')[0] || ''}
                                    onChange={(e) => {
                                        // Petit hack pour réutiliser la logique existante ou on adapte
                                        const currentYear = paymentInfo.expiryDate.split('/')[1] || '';
                                        setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value + '/' + currentYear });
                                    }}
                                    SelectProps={{ native: true }}
                                    InputProps={{ sx: { bgcolor: '#f8f9fa' } }}
                                >
                                    <option value="" disabled>MM</option>
                                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                                </TextField>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 1 }}>YEAR</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={paymentInfo.expiryDate.split('/')[1] ? '20' + paymentInfo.expiryDate.split('/')[1] : ''} // Conversion YY -> YYYY
                                    onChange={(e) => {
                                        const currentMonth = paymentInfo.expiryDate.split('/')[0] || '';
                                        const yearShort = e.target.value.substring(2);
                                        setPaymentInfo({ ...paymentInfo, expiryDate: currentMonth + '/' + yearShort });
                                    }}
                                    SelectProps={{ native: true }}
                                    InputProps={{ sx: { bgcolor: '#f8f9fa' } }}
                                >
                                    <option value="" disabled>YYYY</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </TextField>
                            </Grid>

                            <Grid item xs={4}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold', ml: 1 }}>CVV</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    name="cvv"
                                    value={paymentInfo.cvv}
                                    onChange={handleInputChange}
                                    required
                                    type="password"
                                    InputProps={{
                                        sx: { bgcolor: '#f8f9fa' },
                                        endAdornment: <CreditCardIcon color="action" fontSize="small" />
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} sx={{ mt: 2 }}>
                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                                <Grid container spacing={2}>
                                    <Grid item xs={7}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            disableElevation
                                            disabled={processing}
                                            sx={{
                                                bgcolor: '#0095ff',
                                                textTransform: 'none',
                                                fontWeight: 'bold',
                                                py: 1.5,
                                                '&:hover': { bgcolor: '#007acc' }
                                            }}
                                        >
                                            {processing ? <CircularProgress size={24} color="inherit" /> : `CONFIRM AND PAY ${reservationData.totalPrice}€`}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={5}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => navigate(-1)}
                                            sx={{
                                                textTransform: 'none',
                                                color: '#888',
                                                borderColor: '#ddd',
                                                py: 1.5,
                                                '&:hover': { borderColor: '#bbb', bgcolor: '#f5f5f5' }
                                            }}
                                        >
                                            CANCEL
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};
