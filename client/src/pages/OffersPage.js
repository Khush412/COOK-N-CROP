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
  Container,
  alpha,
  Card,
  CardContent,
  CardActions,
  Divider,
  LinearProgress,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StarsIcon from '@mui/icons-material/Stars';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import offerService from '../services/offerService';
import Loader from '../custom_components/Loader';

const OffersPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
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
      <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: { xs: 4, sm: 6, md: 8 } }}>
          <Loader size="large" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
        <Alert severity="error" sx={{ my: 2, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10, md: 12 }, py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, sm: 4, md: 4 }, textAlign: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: { xs: 1, sm: 2 } }}>
          <LocalOfferIcon sx={{ fontSize: isMobile ? 32 : 48, color: theme.palette.primary.main }} />
          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            component="h1" 
            fontWeight="800" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' }
            }}
          >
            Exclusive Offers
          </Typography>
        </Stack>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          color="text.secondary" 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            maxWidth: isMobile ? 300 : 600,
            mx: 'auto',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
          }}
        >
          Unlock personalized deals based on your shopping journey. Climb membership tiers to access premium discounts.
        </Typography>
      </Box>

      {/* Membership Status Card */}
      <Card sx={{ 
        mb: { xs: 3, sm: 4, md: 4 }, 
        borderRadius: isMobile ? 2 : 3, 
        border: `2px solid ${getTierColor(userTier)}`,
        background: `linear-gradient(135deg, ${alpha(getTierColor(userTier), 0.1)}, ${alpha(theme.palette.background.paper, 0.8)})`,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mb: { xs: 1, sm: 2 } }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <StarsIcon sx={{ fontSize: isMobile ? 24 : 36, color: getTierColor(userTier) }} />
                <Box>
                  <Typography variant={isMobile ? "body1" : "h5"} sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1.25rem', md: '1.5rem' } }}>
                    {getTierLabel(userTier)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    Current Membership Tier
                  </Typography>
                </Box>
              </Stack>
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant={isMobile ? "h6" : "h4"} sx={{ fontWeight: 800, fontFamily: theme.typography.fontFamily, color: getTierColor(userTier), fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
                ₹{totalSpent.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                Total Spent • {orderCount} Orders
              </Typography>
            </Box>
          </Box>
          
          {getNextTier && (
            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <Divider sx={{ mb: { xs: 1, sm: 2 } }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, fontFamily: theme.typography.fontFamily, mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Progress to {getNextTier.name} Tier
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="center">
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (totalSpent / getNextTier.spending) * 100)} 
                    sx={{ 
                      height: isMobile ? 6 : 10, 
                      borderRadius: isMobile ? 3 : 5,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getNextTier.color
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, minWidth: isMobile ? 120 : 200, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  ₹{totalSpent.toFixed(2)} of ₹{getNextTier.spending} spent
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1, sm: 2 }} alignItems="center" sx={{ mt: { xs: 0.5, sm: 1 } }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(100, (orderCount / getNextTier.orders) * 100)} 
                    sx={{ 
                      height: isMobile ? 6 : 10, 
                      borderRadius: isMobile ? 3 : 5,
                      bgcolor: alpha(theme.palette.divider, 0.3),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getNextTier.color
                      }
                    }} 
                  />
                </Box>
                <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, minWidth: isMobile ? 120 : 200, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  {orderCount} of {getNextTier.orders} orders
                </Typography>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Offers Section */}
      <Typography 
        variant={isMobile ? "h6" : "h4"} 
        sx={{ 
          fontFamily: theme.typography.fontFamily,
          fontWeight: 700,
          mb: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' }
        }}
      >
        <LocalOfferIcon sx={{ color: theme.palette.primary.main, fontSize: isMobile ? 20 : 28 }} />
        Your Personalized Offers
      </Typography>

      {offers.length === 0 ? (
        <Paper sx={{ p: isMobile ? 3 : 6, textAlign: 'center', borderRadius: isMobile ? 2 : 3, boxShadow: theme.shadows[3] }}>
          <LocalOfferIcon sx={{ fontSize: isMobile ? 40 : 64, color: 'grey.400', mb: 2 }} />
          <Typography 
            variant={isMobile ? "body1" : "h5"} 
            color="text.secondary" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              mb: 2,
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            No Special Offers Available
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              fontFamily: theme.typography.fontFamily,
              mb: isMobile ? 2 : 3,
              maxWidth: isMobile ? 250 : 500,
              mx: 'auto',
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
            }}
          >
            We couldn't find any special offers for your current membership tier. 
            Check back later or make a purchase to unlock exclusive deals.
          </Typography>
          <Button 
            variant="contained" 
            size={isMobile ? "small" : "large"}
            onClick={() => navigate('/CropCorner')}
            sx={{ 
              borderRadius: '50px',
              px: isMobile ? 2 : 4,
              py: isMobile ? 0.75 : 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: { xs: '0.8rem', sm: '0.875rem', md: '1rem' }
            }}
          >
            {isMobile ? 'Shop' : 'Start Shopping'}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={isMobile ? 1.5 : 3}>
          {offers.map((offer) => (
            <Grid key={offer._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: isMobile ? 2 : 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'translateY(-8px)',
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
                  borderWidth: isMobile ? '0 40px 40px 0' : '0 60px 60px 0',
                  borderColor: `transparent ${theme.palette.primary.main} transparent transparent`,
                  zIndex: 1
                }} />
                <CardContent sx={{ flexGrow: 1, pt: isMobile ? 2 : 3, pb: isMobile ? 1 : 2, position: 'relative', zIndex: 2 }}>
                  <Box sx={{ mb: isMobile ? 1 : 2, textAlign: 'center' }}>
                    <Typography 
                      variant={isMobile ? "h4" : "h3"} 
                      fontWeight="800" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        color: theme.palette.primary.main,
                        mb: 0.5,
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
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
                        borderRadius: '8px',
                        height: isMobile ? 20 : 24,
                        fontSize: isMobile ? '0.6rem' : '0.75rem'
                      }} 
                    />
                  </Box>
                  
                  <Divider sx={{ my: isMobile ? 1 : 2 }} />
                  
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      mb: isMobile ? 1 : 2,
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' }
                    }}
                  >
                    {offer.code}
                  </Typography>
                  
                  <Box sx={{ mb: isMobile ? 1 : 2 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        mb: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    >
                      <TrendingUpIcon fontSize="small" sx={{ fontSize: isMobile ? 12 : 16 }} />
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
                        gap: 0.5,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
                      }}
                    >
                      <EmojiEventsIcon fontSize="small" sx={{ fontSize: isMobile ? 12 : 16 }} />
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ p: isMobile ? 1 : 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size={isMobile ? "small" : "large"}
                    onClick={() => handleApplyCoupon(offer.code)}
                    sx={{
                      borderRadius: '50px',
                      py: isMobile ? 0.75 : 1.5,
                      fontWeight: 'bold',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                      },
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
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
      <Box sx={{ mt: { xs: 4, sm: 6, md: 6 }, p: isMobile ? 2 : 3, borderRadius: isMobile ? 2 : 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography 
          variant={isMobile ? "h6" : "h4"} 
          sx={{ 
            fontFamily: theme.typography.fontFamily,
            fontWeight: 700,
            mb: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' }
          }}
        >
          <StarsIcon sx={{ color: theme.palette.primary.main, fontSize: isMobile ? 20 : 28 }} />
          Membership Tiers & Benefits
        </Typography>
        
        <Grid container spacing={isMobile ? 1.5 : 3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: isMobile ? 1 : 2, border: '1px solid #CD7F32', boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: isMobile ? 1 : 2 }}>
                  <Chip 
                    label="Bronze" 
                    sx={{ 
                      bgcolor: '#CD7F32', 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.8rem' : '1.1rem',
                      height: isMobile ? 24 : 36,
                      mb: 0.5
                    }} 
                  />
                  <Typography variant={isMobile ? "body1" : "h5"} sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1.25rem', md: '1.5rem' } }}>
                    ₹0+
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    or 0+ orders
                  </Typography>
                </Box>
                
                <Divider sx={{ my: isMobile ? 1 : 2 }} />
                
                <Stack spacing={isMobile ? 0.75 : 1.5}>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <EmojiEventsIcon fontSize="small" sx={{ color: '#CD7F32', fontSize: isMobile ? 12 : 16 }} />
                    Earn 3% Harvest Coins
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: '#CD7F32', fontSize: isMobile ? 12 : 16 }} />
                    Access to basic offers
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: '#CD7F32', fontSize: isMobile ? 12 : 16 }} />
                    Limited to moderate discounts
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: isMobile ? 1 : 2, border: '1px solid #C0C0C0', boxShadow: theme.shadows[6] }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: isMobile ? 1 : 2 }}>
                  <Chip 
                    label="Silver" 
                    sx={{ 
                      bgcolor: '#C0C0C0', 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.8rem' : '1.1rem',
                      height: isMobile ? 24 : 36,
                      mb: 0.5
                    }} 
                  />
                  <Typography variant={isMobile ? "body1" : "h5"} sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1.25rem', md: '1.5rem' } }}>
                    ₹2000+
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    or 5+ orders
                  </Typography>
                </Box>
                
                <Divider sx={{ my: isMobile ? 1 : 2 }} />
                
                <Stack spacing={isMobile ? 0.75 : 1.5}>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <EmojiEventsIcon fontSize="small" sx={{ color: '#C0C0C0', fontSize: isMobile ? 12 : 16 }} />
                    Earn 5% Harvest Coins
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: '#C0C0C0', fontSize: isMobile ? 12 : 16 }} />
                    Access to better offers
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: '#C0C0C0', fontSize: isMobile ? 12 : 16 }} />
                    Higher-value discounts
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', borderRadius: isMobile ? 1 : 2, border: '1px solid #FFD700', boxShadow: theme.shadows[8] }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: isMobile ? 1 : 2 }}>
                  <Chip 
                    label="Gold" 
                    sx={{ 
                      bgcolor: '#FFD700', 
                      color: 'black', 
                      fontWeight: 'bold',
                      fontSize: isMobile ? '0.8rem' : '1.1rem',
                      height: isMobile ? 24 : 36,
                      mb: 0.5
                    }} 
                  />
                  <Typography variant={isMobile ? "body1" : "h5"} sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.9rem', sm: '1.25rem', md: '1.5rem' } }}>
                    ₹8000+
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    or 10+ orders
                  </Typography>
                </Box>
                
                <Divider sx={{ my: isMobile ? 1 : 2 }} />
                
                <Stack spacing={isMobile ? 0.75 : 1.5}>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <EmojiEventsIcon fontSize="small" sx={{ color: '#FFD700', fontSize: isMobile ? 12 : 16 }} />
                    Earn 8% Harvest Coins
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <LocalOfferIcon fontSize="small" sx={{ color: '#FFD700', fontSize: isMobile ? 12 : 16 }} />
                    Access to all exclusive offers
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                    <TrendingUpIcon fontSize="small" sx={{ color: '#FFD700', fontSize: isMobile ? 12 : 16 }} />
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