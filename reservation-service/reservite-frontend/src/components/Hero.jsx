import { useState } from 'react';
import { Box, Container, Typography, Paper, TextField, Button, Grid, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';

export const Hero = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState({
        destination: '',
        checkIn: format(new Date(), 'yyyy-MM-dd'),
        checkOut: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        guests: 2
    });

    const handleSearch = () => {
        // Rediriger vers la page hotels avec les paramètres de recherche
        const params = new URLSearchParams();
        if (search.destination) params.append('city', search.destination);
        navigate(`/hotels?${params.toString()}`);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                height: '80vh',
                width: '100%',
                backgroundImage: 'url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                }
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
                <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Trouvez votre prochain séjour de rêve
                </Typography>
                <Typography variant="h5" sx={{ mb: 6, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                    Découvrez des hôtels exceptionnels aux meilleurs prix
                </Typography>

                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Destination"
                                placeholder="Où allez-vous ?"
                                value={search.destination}
                                onChange={(e) => setSearch({ ...search, destination: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocationOnIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Arrivée - Départ"
                                type="date"
                                value={search.checkIn}
                                onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarTodayIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                label="Voyageurs"
                                type="number"
                                value={search.guests}
                                onChange={(e) => setSearch({ ...search, guests: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleSearch}
                                sx={{
                                    height: '56px',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    backgroundColor: '#0071c2',
                                    '&:hover': { backgroundColor: '#005999' }
                                }}
                                startIcon={<SearchIcon />}
                            >
                                Rechercher
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
};
