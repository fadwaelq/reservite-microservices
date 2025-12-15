import { Card, CardContent, CardMedia, Typography, Button, Box, Rating, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import HotelIcon from '@mui/icons-material/Hotel';
import { useState } from 'react';

export const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Images d'hôtels avec fallback
  const getHotelImage = (hotel) => {
    // Si erreur de chargement, utiliser une couleur de fond avec icône
    if (imageError) {
      return null;
    }

    // Si l'hôtel a une imageUrl, l'utiliser
    if (hotel.imageUrl) {
      return hotel.imageUrl;
    }

    // Images de secours depuis Unsplash
    const fallbackImages = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
    ];

    // Utiliser une image différente basée sur l'ID de l'hôtel
    return fallbackImages[hotel.id % fallbackImages.length];
  };

  const imageUrl = getHotelImage(hotel);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
        }
      }}
    >
      {imageUrl ? (
        <CardMedia
          component="img"
          height="220"
          image={imageUrl}
          alt={hotel.name}
          sx={{ objectFit: 'cover' }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Box
          sx={{
            height: 220,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.light',
            color: 'white'
          }}
        >
          <HotelIcon sx={{ fontSize: 80, opacity: 0.5 }} />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography gutterBottom variant="h5" component="h2" sx={{ mb: 0 }}>
            {hotel.name}
          </Typography>
          {hotel.stars && (
            <Chip
              icon={<HotelIcon />}
              label={`${hotel.stars}★`}
              size="small"
              color="primary"
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {hotel.address && `${hotel.address}, `}{hotel.city}{hotel.country && `, ${hotel.country}`}
          </Typography>
        </Box>

        {hotel.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={hotel.rating} precision={0.5} readOnly size="small" />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {hotel.rating}/5
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
          {hotel.description ?
            (hotel.description.length > 100 ?
              `${hotel.description.substring(0, 100)}...` :
              hotel.description
            ) :
            'Un hébergement de qualité pour votre séjour.'
          }
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/hotels/${hotel.id}`)}
          sx={{ mt: 'auto' }}
        >
          Voir les chambres
        </Button>
      </CardContent>
    </Card>
  );
};