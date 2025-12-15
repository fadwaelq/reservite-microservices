import { useState, useEffect } from 'react';
import { Container, Grid, Typography, CircularProgress, Box, Button } from '@mui/material';
import { Hero } from '../components/Hero';
import { HotelCard } from '../components/HotelCard';
import { hotelService } from '../services/hotelService';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
    const [featuredHotels, setFeaturedHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFeaturedHotels = async () => {
            try {
                // Pour l'instant, on récupère tous les hôtels et on en affiche les 3 premiers
                // Idéalement, le backend aurait un endpoint /api/hotels/featured
                const hotels = await hotelService.getAllHotels();
                setFeaturedHotels(hotels.slice(0, 3));
            } catch (error) {
                console.error('Erreur chargement hôtels populaires', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedHotels();
    }, []);

    return (
        <Box>
            <Hero />

            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h2" fontWeight="bold">
                        Nos hébergements populaires
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/hotels')}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Voir tout
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {featuredHotels.map((hotel) => (
                            <Grid item key={hotel.id} xs={12} sm={6} md={4}>
                                <HotelCard hotel={hotel} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>

            {/* Section Promotionnelle */}
            <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Profitez de nos offres exclusives
                            </Typography>
                            <Typography variant="h6" color="text.secondary" paragraph>
                                Inscrivez-vous à notre newsletter pour recevoir les meilleures offres directement dans votre boîte mail.
                            </Typography>
                            <Button variant="contained" size="large" sx={{ mt: 2, bgcolor: '#0071c2' }}>
                                S'inscrire
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Offres"
                                sx={{ width: '100%', borderRadius: 4 }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};
