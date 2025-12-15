import { Paper, TextField, MenuItem, Box, Typography, Slider } from '@mui/material';
import { useState } from 'react';

export const HotelFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    city: '',
    minRating: 0,
    maxPrice: 1000,
    sortBy: ''
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e7e7e7' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Rechercher
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Ville"
          value={filters.city}
          onChange={(e) => handleChange('city', e.target.value)}
          fullWidth
        />

        <Box>
          <Typography gutterBottom>Note minimum</Typography>
          <Slider
            value={filters.minRating}
            onChange={(e, value) => handleChange('minRating', value)}
            min={0}
            max={5}
            step={0.5}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        {/* ⚠️ Filtre par prix désactivé - Les hôtels mock n'ont pas de prix */}
        {/* <Box>
          <Typography gutterBottom>Prix maximum: {filters.maxPrice}€</Typography>
          <Slider
            value={filters.maxPrice}
            onChange={(e, value) => handleChange('maxPrice', value)}
            min={0}
            max={1000}
            step={50}
            valueLabelDisplay="auto"
          />
        </Box> */}

        <TextField
          select
          label="Trier par"
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          fullWidth
        >
          <MenuItem value="">Par défaut</MenuItem>
          <MenuItem value="rating">Note (meilleure d'abord)</MenuItem>
          {/* Prix désactivé car pas de données de prix dans les hôtels */}
          {/* <MenuItem value="price-asc">Prix croissant</MenuItem>
          <MenuItem value="price-desc">Prix décroissant</MenuItem> */}
        </TextField>
      </Box>
    </Paper>
  );
};