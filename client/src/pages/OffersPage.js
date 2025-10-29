import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Button,
  useTheme,
  Stack,
  Container,
  alpha,
  Card,
  CardContent,
  CardActions,
  Divider,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarsIcon from '@mui/icons-material/Stars';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import offerService from '../services/offerService';

const OffersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userTier, setUserTier] = useState('bronze');
  const [totalSpent, setTotalSpent] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    fetchPersonalizedOffers();
  }, []);

  const fetchPersonalizedOffers = async () => {
    try {
      setLoading(true);
      const response = await offerService.getPersonalizedOffers();
      setOffers(response.data.coupons || []);
      setUserTier(response.data.userTier || 'bronze');
      setTotalSpent(response.data.totalSpent || 0);
      setOrderCount(response.data.orderCount || 0);
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

  const getNextTierRequirements = () => {
    if (userTier === 'gold') return null;
    
    if (userTier === 'silver') {
      return {
        name: 'Gold',
        spending: 8000,
        orders: 10,
        color: '#FFD700'
      };
    }
    
    return {
      name: 'Silver',
      spending: 2000,
      orders: 5,
      color: '#C0C0C0'
    };
  };

  const handleApplyCoupon = (couponCode) => {
    // Navigate back to cart with the coupon code
    navigate('/cart', { state: { appliedCoupon: couponCode } });
  };

  const getNextTier = getNextTierRequirements();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
          <LocalOfferIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />
          <Typography 
            variant="h2" 
            component="h1" 
            fontWeight="800" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Exclusive Offers
          </Typography>
        </Stack>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            maxWidth: 600,
            mx: 'auto'
          }}
        >
          Unlock personalized deals based on your shopping journey. Climb membership tiers to access premium discounts.
        </Typography>
      </Box>

      {/* Membership Status Card */}
      <Card sx={{ 
        mb: 4, 
        borderRadius: 3, 
        border: `2px solid ${getTierColor(userTier)}`,
        background: `linear-gradient(135deg, ${alpha(getTierColor(userTier), 0.1)}, ${alpha(theme.palette.background.paper, 0.8)})`,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={2}>
                <StarsIcon sx={{ fontSize: 36, color: getTierColor(userTier) }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                    {getTierLabel(userTier)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    Current Membership Tier
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, color: getTierColor(userTier) }}>
                ₹{totalSpent.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                Total Spent • {orderCount} Orders
              </Typography>
            </Box>
          </Box>
          
          {getNextTier && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: 1 }}>
                Progress to {getNextTier.name} Tier
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (totalSpent / getNextTier.spending) * 100)} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getNextTier.color
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, minWidth: 200 }}>
                  ₹{totalSpent.toFixed(2)} of ₹{getNextTier.spending} spent
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (orderCount / getNextTier.orders) * 100)} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getNextTier.color
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, minWidth: 200 }}>
                  {orderCount} of {getNextTier.orders} orders
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Offers Section */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontFamily: theme.typography.fontFamily,
          fontWeight: 700,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <LocalOfferIcon sx={{ color: theme.palette.primary.main }} />
        Your Personalized Offers
      </Typography>

      {offers.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, boxShadow: theme.shadows[3] }}>
          <LocalOfferIcon sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              mb: 2,
              fontWeight: 600
            }}
          >
            No Special Offers Available
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              mb: 3,
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            We couldn't find any special offers for your current membership tier. 
            Check back later or make a purchase to unlock exclusive deals.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/CropCorner')}
            sx={{ 
              borderRadius: '50px',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {offers.map((offer) => (
            <Grid key={offer._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[12],
                    border: `1px solid ${theme.palette.primary.main}`
                  },
                  position: 'relative',
                  overflow: 'hidden',
                  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.primary.light, 0.05)})`
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: 0, 
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 60px 60px 0',
                  borderColor: `transparent ${theme.palette.primary.main} transparent transparent`,
                  zIndex: 1
                }} />
                <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2, position: 'relative', zIndex: 2 }}>
                  <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <Typography 
                      variant="h3" 
                      fontWeight="800" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.primary.main,
                        mb: 1
                      }}
                    >
                      {offer.discountType === 'percentage' 
                        ? `${offer.discountValue}%` 
                        : `₹${offer.discountValue}`}
                    </Typography>
                    <Chip 
                      label={offer.discountType === 'percentage' ? 'OFF' : 'DISCOUNT'} 
                      color="primary" 
                      size="small" 
                      sx={{ 
                        fontWeight: 'bold',
                        borderRadius: '8px'
                      }} 
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      mb: 2,
                      textAlign: 'center',
                      fontWeight: 700
                    }}
                  >
                    {offer.code}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <TrendingUpIcon fontSize="small" />
                      {offer.minPurchase > 0 
                        ? `Minimum purchase: ₹${offer.minPurchase}` 
                        : 'No minimum purchase required'}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <EmojiEventsIcon fontSize="small" />
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() => handleApplyCoupon(offer.code)}
                    sx={{
                      borderRadius: '50px',
                      py: 1.5,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Apply to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Membership Benefits Section */}
      <Box sx={{ mt: 6, p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            fontWeight: 700,
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <StarsIcon sx={{ color: theme.palette.primary.main }} />
          Membership Tiers & Benefits
        </Typography>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #CD7F32', boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Chip 
                    label="Bronze" 
                    sx={{ 
                      bgcolor: '#CD7F32', 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      height: 36,
                      mb: 1
                    }} 
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                    ₹0+
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    or 0+ orders
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1.5}>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon fontSize="small" sx={{ color: '#CD7F32' }} />
                    Earn 3% Harvest Coins
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: '#CD7F32' }} />
                    Access to basic offers
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: '#CD7F32' }} />
                    Limited to moderate discounts
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #C0C0C0', boxShadow: theme.shadows[6] }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Chip 
                    label="Silver" 
                    sx={{ 
                      bgcolor: '#C0C0C0', 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      height: 36,
                      mb: 1
                    }} 
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                    ₹2000+
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    or 5+ orders
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1.5}>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon fontSize="small" sx={{ color: '#C0C0C0' }} />
                    Earn 5% Harvest Coins
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: '#C0C0C0' }} />
                    Access to better offers
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: '#C0C0C0' }} />
                    Higher-value discounts
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #FFD700', boxShadow: theme.shadows[8] }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Chip 
                    label="Gold" 
                    sx={{ 
                      bgcolor: '#FFD700', 
                      color: 'black', 
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      height: 36,
                      mb: 1
                    }} 
                  />
                  <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
                    ₹8000+
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    or 10+ orders
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Stack spacing={1.5}>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon fontSize="small" sx={{ color: '#FFD700' }} />
                    Earn 8% Harvest Coins
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: '#FFD700' }} />
                    Access to all exclusive offers
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: '#FFD700' }} />
                    Premium discounts & benefits
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default OffersPage;