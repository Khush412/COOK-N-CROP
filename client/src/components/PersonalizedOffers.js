import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Chip,
  Button,
  useTheme,
  Stack,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarsIcon from '@mui/icons-material/Stars';
import offerService from '../services/offerService';
import Loader from '../custom_components/Loader';

const PersonalizedOffers = ({ onApplyCoupon }) => {
  const theme = useTheme();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTier, setUserTier] = useState('bronze');

  useEffect(() => {
    fetchPersonalizedOffers();
  }, []);

  const fetchPersonalizedOffers = async () => {
    try {
      setLoading(true);
      const response = await offerService.getPersonalizedOffers();
      setOffers(response.data.coupons || []);
      setUserTier(response.data.userTier || 'bronze');
    } catch (err) {
      setError('Failed to load personalized offers');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'bronze': return '#CD7F32';
      default: return theme.palette.primary.main;
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 'gold': return 'Gold Member';
      case 'silver': return 'Silver Member';
      case 'bronze': return 'Bronze Member';
      default: return 'Member';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Loader size="medium" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <LocalOfferIcon color="primary" />
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight="bold" 
          sx={{ fontFamily: theme.typography.fontFamily }}
        >
          Special Offers For You
        </Typography>
        <Chip
          icon={<StarsIcon />}
          label={getTierLabel(userTier)}
          sx={{
            bgcolor: getTierColor(userTier),
            color: 'white',
            fontWeight: 'bold',
            ml: 2
          }}
        />
      </Stack>
      
      <Grid container spacing={3}>
        {offers.map((offer) => (
          <Grid key={offer._id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: `2px solid ${theme.palette.primary.main}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  borderTop: '40px solid #FF5722',
                  borderLeft: '40px solid transparent',
                  zIndex: 1
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    mb: 1,
                    color: theme.palette.primary.main
                  }}
                >
                  {offer.discountType === 'percentage' 
                    ? `${offer.discountValue}% OFF` 
                    : `₹${offer.discountValue} OFF`}
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    mb: 2,
                    minHeight: '3rem'
                  }}
                >
                  {offer.code}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    mb: 2
                  }}
                >
                  {offer.minPurchase > 0 
                    ? `Minimum purchase: ₹${offer.minPurchase}` 
                    : 'No minimum purchase required'}
                </Typography>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    display: 'block',
                    mb: 2
                  }}
                >
                  Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => onApplyCoupon && onApplyCoupon(offer.code)}
                  sx={{
                    mt: 'auto',
                    borderRadius: '50px',
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none'
                  }}
                >
                  Apply Coupon
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonalizedOffers;