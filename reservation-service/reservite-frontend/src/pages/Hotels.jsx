// src/pages/Hotels.jsx
import { useState, useEffect } from 'react';
import { hotelService } from '../services/hotelService';
import { Container, Grid, Typography, CircularProgress, Box } from '@mui/material';
import { HotelCard } from '../components/HotelCard';
import { HotelFilters } from '../components/HotelFilters';

export const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const data = await hotelService.getAllHotels();
        setHotels(data);
        setFilteredHotels(data);
      } catch (err) {
        console.error("Impossible de charger les hôtels", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  const handleFilterChange = (filters) => {
    let filtered = [...hotels];

    // Filtre par ville
    if (filters.city && filters.city.trim() !== '') {
      filtered = filtered.filter(h =>
        h.city?.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    // Filtre par note minimum
    if (filters.minRating > 0) {
      filtered = filtered.filter(h => (h.rating || 0) >= filters.minRating);
    }

    // ⚠️ FILTRAGE PAR PRIX DÉSACTIVÉ (les hôtels mock n'ont pas de prix)
    // Si vous avez besoin du filtre par prix, ajoutez un champ minPrice aux hôtels mock
    // if (filters.maxPrice < 1000) {
    //   filtered = filtered.filter(h => (h.minPrice || 0) <= filters.maxPrice);
    // }

    // Tri
    if (filters.sortBy) {
      if (filters.sortBy === 'rating') {
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      // Note: tri par prix désactivé car pas de prix dans les hôtels mock
      // if (filters.sortBy === 'price-asc') {
      //   filtered.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));
      // }
      // if (filters.sortBy === 'price-desc') {
      //   filtered.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      // }
    }

    setFilteredHotels(filtered);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f7fa', minHeight: '100vh', pb: 8 }}>
      {/* Hero Header */}
      <Box sx={{
        bgcolor: '#003580',
        color: 'white',
        py: 6,
        mb: 4,
        background: 'linear-gradient(45deg, #003580 30%, #0071c2 90%)'
      }}>
        <Container maxWidth="xl">
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Trouvez votre prochain séjour
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Recherchez des offres sur des hôtels, des hébergements indépendants et plus encore
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Sidebar Filtres - Sticky */}
          <Grid item xs={12} md={3}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <HotelFilters onFilterChange={handleFilterChange} />
            </Box>
          </Grid>

          {/* Grille Hôtels */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                {filteredHotels.length} établissement{filteredHotels.length > 1 && 's'} trouvé{filteredHotels.length > 1 && 's'}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {filteredHotels.length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'white', borderRadius: 2 }}>
                    <Typography href="#" variant="h6" color="text.secondary">
                      Aucun hôtel ne correspond à vos critères.
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      Essayez de modifier vos filtres.
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                filteredHotels.map(hotel => (
                  <Grid item xs={12} sm={6} lg={4} key={hotel.id}>
                    <HotelCard hotel={hotel} />
                  </Grid>
                ))
              )}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};