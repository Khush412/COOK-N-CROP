import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Divider, Stack, Paper, Chip, LinearProgress, useMediaQuery } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PercentIcon from '@mui/icons-material/Percent';
import RedeemIcon from '@mui/icons-material/Redeem';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../contexts/AuthContext';
import { getHarvestCoinsBalance } from '../services/loyaltyService';
import Loader from '../custom_components/Loader';

const RewardsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [harvestCoins, setHarvestCoins] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch user's Harvest Coins data
  useEffect(() => {
    const fetchHarvestCoinsData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const result = await getHarvestCoinsBalance();
        if (result.success) {
          setHarvestCoins(result);
        } else {
          setError(result.message || 'Failed to fetch Harvest Coins data');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch Harvest Coins data');
      } finally {
        setLoading(false);
      }
    };

    fetchHarvestCoinsData();
  }, [user]);

  // Tier definitions based on real backend logic
  const tiers = [
    { 
      name: "Bronze", 
      minSpent: 0,
      maxSpent: 1999, 
      minOrders: 0,
      maxOrders: 4,
      benefits: [
        "3% Harvest Coins back on purchases",
        "Birthday reward",
        "Free delivery on orders ₹750+"
      ],
      color: "#CD7F32",
      icon: <StarIcon sx={{ fontSize: isMobile ? 24 : 36 }} />
    },
    { 
      name: "Silver", 
      minSpent: 2000,
      maxSpent: 7999, 
      minOrders: 5,
      maxOrders: 9,
      benefits: [
        "5% Harvest Coins back on purchases",
        "All Bronze benefits",
        "Early access to new products",
        "Free delivery on orders ₹500+"
      ],
      color: "#C0C0C0",
      icon: <StarIcon sx={{ fontSize: isMobile ? 24 : 36 }} />
    },
    { 
      name: "Gold", 
      minSpent: 8000,
      maxSpent: Infinity, 
      minOrders: 10,
      maxOrders: Infinity,
      benefits: [
        "8% Harvest Coins back on purchases",
        "All Silver benefits",
        "Exclusive member events",
        "Free delivery on all orders"
      ],
      color: "#FFD700",
      icon: <StarIcon sx={{ fontSize: isMobile ? 24 : 36 }} />
    }
  ];

  // Get current user tier
  const getCurrentTier = () => {
    if (!harvestCoins) return tiers[0];
    
    // Check if user qualifies for Gold tier first (highest tier)
    if (harvestCoins.totalSpent >= 8000 || harvestCoins.totalOrders >= 10) {
      return tiers[2]; // Gold tier
    }
    
    // Check if user qualifies for Silver tier
    if (harvestCoins.totalSpent >= 2000 || harvestCoins.totalOrders >= 5) {
      return tiers[1]; // Silver tier
    }
    
    // Default to Bronze tier
    return tiers[0];
  };

  // Get next tier
  const getNextTier = () => {
    if (!harvestCoins) return tiers[1];
    
    // If user is at Gold tier, there is no next tier
    if (harvestCoins.totalSpent >= 8000 || harvestCoins.totalOrders >= 10) {
      return null;
    }
    
    // If user is at Silver tier, next tier is Gold
    if (harvestCoins.totalSpent >= 2000 || harvestCoins.totalOrders >= 5) {
      return tiers[2]; // Gold tier
    }
    
    // If user is at Bronze tier, next tier is Silver
    return tiers[1]; // Silver tier
  };

  // Calculate progress to next tier based on spending or orders (whichever is closer to next tier)
  const getProgressToNextTier = () => {
    if (!harvestCoins) return 0;
    
    const nextTier = getNextTier();
    if (!nextTier) return 100; // Already at highest tier
    
    // Calculate progress based on spending
    let spendingProgress = 0;
    if (nextTier.name === "Silver") {
      // Progress to Silver: ₹2000 or 5 orders
      const spentProgress = (harvestCoins.totalSpent / 2000) * 100;
      const orderProgress = (harvestCoins.totalOrders / 5) * 100;
      spendingProgress = Math.min(100, Math.max(spentProgress, orderProgress));
    } else if (nextTier.name === "Gold") {
      // Progress to Gold: ₹8000 or 10 orders
      const spentProgress = (harvestCoins.totalSpent / 8000) * 100;
      const orderProgress = (harvestCoins.totalOrders / 10) * 100;
      spendingProgress = Math.min(100, Math.max(spentProgress, orderProgress));
    }
    
    return spendingProgress;
  };

  // Get progress details for display
  const getProgressDetails = () => {
    if (!harvestCoins) return { spent: 0, orders: 0, nextTier: null };
    
    const nextTier = getNextTier();
    if (!nextTier) return { spent: 100, orders: 100, nextTier: null };
    
    let spentProgress = 0;
    let orderProgress = 0;
    
    if (nextTier.name === "Silver") {
      // Progress to Silver: ₹2000 or 5 orders
      spentProgress = Math.min(100, (harvestCoins.totalSpent / 2000) * 100);
      orderProgress = Math.min(100, (harvestCoins.totalOrders / 5) * 100);
    } else if (nextTier.name === "Gold") {
      // Progress to Gold: ₹8000 or 10 orders
      spentProgress = Math.min(100, (harvestCoins.totalSpent / 8000) * 100);
      orderProgress = Math.min(100, (harvestCoins.totalOrders / 10) * 100);
    }
    
    return {
      spent: spentProgress,
      orders: orderProgress,
      nextTier: nextTier
    };
  };

  // Updated redemption rates with more meaningful options for a food/produce site
  const redemptionRates = [
    { coins: 100, value: "₹50 off", description: "On orders ₹300+" },
    { coins: 250, value: "₹150 off", description: "On orders ₹600+" },
    { coins: 500, value: "₹350 off", description: "On orders ₹1200+" },
    { coins: 1000, value: "₹800 off", description: "On orders ₹2500+" }
  ];

  // How it works steps based on real functionality
  const howItWorksSteps = [
    {
      title: "Earn Coins",
      description: "Get Harvest Coins on every purchase based on your membership tier",
      icon: <CurrencyRupeeIcon sx={{ fontSize: isMobile ? 24 : 36, color: theme.palette.secondary.main }} />
    },
    {
      title: "Collect & Grow",
      description: "Build your coin balance and unlock higher membership tiers",
      icon: <EmojiEventsIcon sx={{ fontSize: isMobile ? 24 : 36, color: theme.palette.secondary.main }} />
    },
    {
      title: "Redeem for Savings",
      description: "Use coins for instant discounts at checkout (max 5% off)",
      icon: <RedeemIcon sx={{ fontSize: isMobile ? 24 : 36, color: theme.palette.secondary.main }} />
    },
    {
      title: "Enjoy Benefits",
      description: "Unlock exclusive perks as you progress through membership tiers",
      icon: <StarIcon sx={{ fontSize: isMobile ? 24 : 36, color: theme.palette.secondary.main }} />
    }
  ];

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNextTier = getProgressToNextTier();
  const progressDetails = getProgressDetails();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Loader size="large" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      bgcolor: 'background.default',
      py: { xs: 4, sm: 4, md: 6, lg: 8 },
      mt: { xs: 2, sm: 4, md: 6 }
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 4, sm: 5, md: 6, lg: 8 },
          py: { xs: 3, sm: 4, md: 6, lg: 8 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            left: -20, 
            width: isMobile ? 60 : 100, 
            height: isMobile ? 60 : 100, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.1)
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: isMobile ? -30 : -50, 
            right: isMobile ? -30 : -50, 
            width: isMobile ? 120 : 200, 
            height: isMobile ? 120 : 200, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: { xs: 40, sm: 60, md: 80, lg: 100 }, color: 'secondary.main', mb: { xs: 1, sm: 2, md: 3 } }} />
            <Typography 
              variant={isMobile ? "h4" : isTablet ? "h3" : "h1"} 
              sx={{ 
                fontWeight: 800, 
                mb: { xs: 1, sm: 2, md: 3 }, 
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.primary.main,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3.5rem' }
              }}
            >
              Harvest Coins Loyalty Program
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h5"} 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3, md: 4 }, 
                fontFamily: theme.typography.fontFamily, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' }
              }}
            >
              Earn Harvest Coins with every purchase and unlock exclusive benefits
            </Typography>
            
            {!user ? (
              <Stack 
                direction={{ xs: 'row', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2, md: 3 }} 
                justifyContent="center" 
                alignItems="center"
                sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
              >
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  endIcon={<ShoppingCartIcon />}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 1.5, sm: 4, md: 6, lg: 7 },
                    py: { xs: 0.8, sm: 1.5, md: 2, lg: 2.5 },
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1.2rem' },
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                      transform: 'scale(1.05)',
                      backgroundColor: theme.palette.secondary.dark
                    },
                    width: { xs: '48%', sm: 'auto' }
                  }}
                >
                  {isMobile ? 'Sign Up' : 'Sign Up & Start Earning'}
                </Button>
                
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 1.5, sm: 4, md: 6, lg: 7 },
                    py: { xs: 0.8, sm: 1.5, md: 2, lg: 2.5 },
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1.2rem' },
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      borderColor: theme.palette.secondary.dark
                    },
                    width: { xs: '48%', sm: 'auto' }
                  }}
                >
                  {isMobile ? 'Create' : 'Create Account'}
                </Button>
              </Stack>
            ) : (
              <Stack 
                direction={{ xs: 'row', sm: 'row' }} 
                spacing={{ xs: 1, sm: 2, md: 3 }} 
                justifyContent="center" 
                alignItems="center"
                sx={{ mb: { xs: 2, sm: 3, md: 4 } }}
              >
                <Button
                  component={RouterLink}
                  to="/CropCorner"
                  variant="contained"
                  size={isMobile ? "small" : "medium"}
                  endIcon={<ShoppingCartIcon />}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 1.5, sm: 4, md: 6, lg: 7 },
                    py: { xs: 0.8, sm: 1.5, md: 2, lg: 2.5 },
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1.2rem' },
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                      transform: 'scale(1.05)',
                      backgroundColor: theme.palette.secondary.dark
                    },
                    width: { xs: '48%', sm: 'auto' }
                  }}
                >
                  {isMobile ? 'Shop' : 'Start Shopping'}
                </Button>
                
                <Button
                  component={RouterLink}
                  to="/profile"
                  variant="outlined"
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 1.5, sm: 4, md: 6, lg: 7 },
                    py: { xs: 0.8, sm: 1.5, md: 2, lg: 2.5 },
                    fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1.2rem' },
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      borderColor: theme.palette.secondary.dark
                    },
                    width: { xs: '48%', sm: 'auto' }
                  }}
                >
                  {isMobile ? 'Profile' : 'View My Profile'}
                </Button>
              </Stack>
            )}
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 1.5, sm: 2, md: 3 }, 
                bgcolor: alpha(theme.palette.secondary.main, 0.15), 
                borderRadius: { xs: 1, sm: 2, md: 3 }, 
                maxWidth: { xs: '100%', sm: 600, md: 700 }, 
                mx: 'auto',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 'bold',
                  color: theme.palette.secondary.main,
                  fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem', lg: '1rem' }
                }}
              >
                {user 
                  ? `Welcome back, ${user.username}! You're earning ${harvestCoins?.harvestCoinsPercentage || 3}% Harvest Coins on every order.` 
                  : 'Sign up today to start earning Harvest Coins with your first purchase!'}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* User Stats Section */}
        {user && harvestCoins && (
          <Box sx={{ mb: { xs: 4, sm: 5, md: 6, lg: 8 } }}>
            <Card sx={{ 
              borderRadius: { xs: 2, sm: 3 }, 
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              overflow: 'hidden'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexWrap: 'wrap', gap: 1 }}>
                  <EmojiEventsIcon sx={{ fontSize: isMobile ? 24 : 40, color: 'secondary.main' }} />
                  <Typography variant={isMobile ? "h6" : "h4"} sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, fontSize: { xs: '1.1rem', sm: '1.5rem', md: '2rem' } }}>
                    Your Harvest Coins Dashboard
                  </Typography>
                  <Chip
                    icon={<StarIcon />}
                    label={`${currentTier.name} Tier`}
                    sx={{
                      bgcolor: currentTier.color,
                      color: currentTier.name === 'Gold' ? 'black' : 'white',
                      fontWeight: 'bold',
                      ml: 'auto',
                      height: isMobile ? 24 : 32,
                      fontSize: isMobile ? '0.7rem' : '1rem'
                    }}
                  />
                </Box>
                
                <Grid container spacing={isMobile ? 1 : 2}>
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Paper sx={{ p: isMobile ? 1 : 2, textAlign: 'center', borderRadius: isMobile ? 1 : 2, height: '100%' }}>
                      <Typography variant={isMobile ? "h5" : "h3"} fontWeight="bold" color="secondary.main" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' } }}>
                        {harvestCoins.balance}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' } }}>
                        Harvest Coins Balance
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Paper sx={{ p: isMobile ? 1 : 2, textAlign: 'center', borderRadius: isMobile ? 1 : 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                        <CurrencyRupeeIcon sx={{ fontSize: isMobile ? 16 : 24 }} />
                        <Typography variant={isMobile ? "h5" : "h3"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' } }}>
                          {harvestCoins.totalSpent.toFixed(0)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' } }}>
                        Total Spent (₹)
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Paper sx={{ p: isMobile ? 1 : 2, textAlign: 'center', borderRadius: isMobile ? 1 : 2, height: '100%' }}>
                      <Typography variant={isMobile ? "h5" : "h3"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' } }}>
                        {harvestCoins.totalOrders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' } }}>
                        Total Orders
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                    <Paper sx={{ p: isMobile ? 1 : 2, textAlign: 'center', borderRadius: isMobile ? 1 : 2, height: '100%' }}>
                      <Typography variant={isMobile ? "h5" : "h3"} fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: 0.5, fontSize: { xs: '1rem', sm: '1.5rem', md: '2rem' }, color: 'secondary.main' }}>
                        {harvestCoins.harvestCoinsPercentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' } }}>
                        Earning Rate
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Progress to Next Tier */}
                {nextTier && (
                  <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Progress to {nextTier.name} Tier
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {progressToNextTier.toFixed(0)}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressToNextTier} 
                      sx={{ 
                        height: isMobile ? 8 : 12, 
                        borderRadius: isMobile ? 4 : 6,
                        bgcolor: alpha(theme.palette.divider, 0.3),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.secondary.main
                        }
                      }} 
                    />
                    <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                      <Grid container spacing={isMobile ? 1 : 2}>
                        <Grid size={{ xs: 6 }}>
                          <Paper sx={{ p: isMobile ? 1 : 2, textAlign: 'center', borderRadius: isMobile ? 1 : 2 }}>
                            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, color: 'secondary.main', fontSize: { xs: '0.8rem', sm: '1rem', md: '1.25rem' } }}>
                              ₹{harvestCoins.totalSpent.toFixed(0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                              Spent of ₹{nextTier.minSpent.toLocaleString()}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, (harvestCoins.totalSpent / nextTier.minSpent) * 100)} 
                              sx={{ 
                                height: isMobile ? 4 : 6, 
                                borderRadius: isMobile ? 2 : 3,
                                mt: 0.5,
                                bgcolor: alpha(theme.palette.divider, 0.3),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: theme.palette.primary.main
                                }
                              }} 
                            />
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Paper sx={{ p: isMobile ? 1 : 2, textAlign: 'center', borderRadius: isMobile ? 1 : 2 }}>
                            <Typography variant={isMobile ? "body1" : "h6"} sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, color: 'secondary.main', fontSize: { xs: '0.8rem', sm: '1rem', md: '1.25rem' } }}>
                              {harvestCoins.totalOrders}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>
                              Orders of {nextTier.minOrders}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, (harvestCoins.totalOrders / nextTier.minOrders) * 100)} 
                              sx={{ 
                                height: isMobile ? 4 : 6, 
                                borderRadius: isMobile ? 2 : 3,
                                mt: 0.5,
                                bgcolor: alpha(theme.palette.divider, 0.3),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: theme.palette.primary.main
                                }
                              }} 
                            />
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: { xs: 1, sm: 2 } }}>
                      <Chip 
                        label={currentTier.name} 
                        sx={{ 
                          bgcolor: currentTier.color, 
                          color: currentTier.name === 'Gold' ? 'black' : 'white',
                          fontWeight: 'bold',
                          height: isMobile ? 20 : 24,
                          fontSize: isMobile ? '0.6rem' : '0.75rem'
                        }} 
                      />
                      <Chip 
                        label={nextTier.name} 
                        sx={{ 
                          bgcolor: nextTier.color, 
                          color: nextTier.name === 'Gold' ? 'black' : 'white',
                          fontWeight: 'bold',
                          height: isMobile ? 20 : 24,
                          fontSize: isMobile ? '0.6rem' : '0.75rem'
                        }} 
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        <Divider sx={{ my: { xs: 2, sm: 3, md: 4, lg: 6 } }} />

        {/* How It Works */}
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6, lg: 8 } }}>
          <Typography 
            variant={isMobile ? "h5" : isTablet ? "h4" : "h2"} 
            sx={{ 
              fontWeight: 800, 
              mb: { xs: 2, sm: 3, md: 4, lg: 6 }, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary,
              fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem', lg: '2.75rem' }
            }}
          >
            How Harvest Coins Work
          </Typography>
          
          <Grid container spacing={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
            {howItWorksSteps.map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  borderRadius: { xs: 1, sm: 2, md: 3 },
                  boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.08)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`
                  },
                  p: { xs: 1, sm: 2, md: 3 },
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}>
                  <Box sx={{ 
                    width: { xs: 40, sm: 50, md: 60, lg: 70 }, 
                    height: { xs: 40, sm: 50, md: 60, lg: 70 }, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: { xs: 1, sm: 2, md: 3 }
                  }}>
                    {step.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography 
                      variant={isMobile ? "body1" : "h5"} 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: { xs: 1, sm: 2 }, 
                        fontFamily: theme.typography.fontFamily,
                        color: 'secondary.main',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' }
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        color: 'text.secondary',
                        fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.85rem', lg: '0.95rem' }
                      }}
                    >
                      {step.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: { xs: 2, sm: 3, md: 4, lg: 6 } }} />

        {/* Membership Tiers */}
        <Box sx={{ mb: { xs: 4, sm: 5, md: 6, lg: 8 } }}>
          <Typography 
            variant={isMobile ? "h5" : isTablet ? "h4" : "h2"} 
            sx={{ 
              fontWeight: 800, 
              mb: { xs: 2, sm: 3, md: 4 }, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary,
              fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem', lg: '2.75rem' }
            }}
          >
            Membership Tiers
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "h6"} 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 2, sm: 3, md: 4, lg: 6 }, 
              fontFamily: theme.typography.fontFamily, 
              textAlign: 'center',
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.95rem', lg: '1.1rem' }
            }}
          >
            Unlock more benefits as you earn more Harvest Coins
          </Typography>
          
          <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} justifyContent="center">
            {tiers.map((tier, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center',
                    borderRadius: { xs: 1, sm: 2, md: 3 },
                    boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.1)}`,
                    p: { xs: 1, sm: 2, md: 3 },
                    border: `2px solid ${tier.color}`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.2)}`
                    },
                    ...(currentTier.name === tier.name && {
                      boxShadow: `0 0 0 3px ${alpha(theme.palette.secondary.main, 0.5)}`,
                      transform: 'scale(1.05)'
                    })
                  }}
                >
                  {currentTier.name === tier.name && (
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      bgcolor: theme.palette.secondary.main, 
                      color: 'white',
                      px: 0.5, 
                      py: 0.25, 
                      fontSize: isMobile ? '0.5rem' : '0.7rem', 
                      fontWeight: 'bold',
                      borderRadius: 0.5
                    }}>
                      YOUR TIER
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    width: { xs: 30, sm: 40, md: 50, lg: 60 }, 
                    height: { xs: 30, sm: 40, md: 50, lg: 60 }, 
                    borderRadius: '50%', 
                    bgcolor: alpha(tier.color, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 1,
                    color: tier.color
                  }}>
                    {tier.icon}
                  </Box>
                  
                  <Typography 
                    variant={isMobile ? "h6" : "h4"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1, 
                      fontFamily: theme.typography.fontFamily,
                      color: tier.color,
                      fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem', lg: '2rem' }
                    }}
                  >
                    {tier.name}
                  </Typography>
                  
                  <Typography 
                    variant={isMobile ? "body2" : "h6"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: { xs: 1, sm: 2 }, 
                      fontFamily: theme.typography.fontFamily,
                      color: 'text.primary',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem', lg: '1.25rem' }
                    }}
                  >
                    Requirements
                  </Typography>
                  
                  <List sx={{ textAlign: 'left', mb: 1, px: 0.5 }}>
                    <ListItem sx={{ py: 0.25, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: isMobile ? 16 : 28 }}>
                        <CheckCircleIcon sx={{ 
                          fontSize: isMobile ? 12 : 16, 
                          color: tier.color 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`₹${tier.minSpent.toLocaleString()}+ spent`}
                        primaryTypographyProps={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.85rem' },
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.25, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: isMobile ? 16 : 28 }}>
                        <CheckCircleIcon sx={{ 
                          fontSize: isMobile ? 12 : 16, 
                          color: tier.color 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${tier.minOrders}+ orders`}
                        primaryTypographyProps={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.85rem' },
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                  </List>
                  
                  <Typography 
                    variant={isMobile ? "body2" : "h6"} 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: { xs: 1, sm: 2 }, 
                      fontFamily: theme.typography.fontFamily,
                      color: 'text.primary',
                      fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem', lg: '1.25rem' }
                    }}
                  >
                    Benefits
                  </Typography>
                  
                  <List sx={{ textAlign: 'left', mb: 1, px: 0.5 }}>
                    {tier.benefits.map((benefit, idx) => (
                      <ListItem key={idx} sx={{ py: 0.25, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: isMobile ? 16 : 28 }}>
                          <CheckCircleIcon sx={{ 
                            fontSize: isMobile ? 12 : 16, 
                            color: tier.color 
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          primaryTypographyProps={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.6rem', sm: '0.7rem', md: '0.75rem', lg: '0.85rem' },
                            color: 'text.secondary'
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: { xs: 3, sm: 4, md: 6, lg: 10 },
          borderRadius: { xs: 2, sm: 3, md: 4 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -20, 
            left: -20, 
            width: isMobile ? 60 : 100, 
            height: isMobile ? 60 : 100, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            opacity: 0.5
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: isMobile ? -30 : -50, 
            right: isMobile ? -30 : -50, 
            width: isMobile ? 120 : 200, 
            height: isMobile ? 120 : 200, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            opacity: 0.5
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 1, sm: 2, md: 4 } }}>
            <StarIcon sx={{ fontSize: { xs: 40, sm: 60, md: 80 }, color: 'secondary.main', mb: { xs: 2, sm: 3, md: 4 } }} />
            <Typography 
              variant={isMobile ? "h5" : isTablet ? "h4" : "h2"} 
              sx={{ 
                fontWeight: 800, 
                mb: { xs: 2, sm: 3, md: 4 }, 
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem', lg: '2.75rem' }
              }}
            >
              Ready to Start Earning?
            </Typography>
            <Typography 
              variant={isMobile ? "body1" : "h5"} 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 2, sm: 3, md: 4, lg: 5 }, 
                fontFamily: theme.typography.fontFamily, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem', lg: '1.25rem' }
              }}
            >
              Join thousands of satisfied customers who are already enjoying the benefits of Harvest Coins
            </Typography>
            
            <Stack 
              direction={{ xs: 'row', sm: 'row' }} 
              spacing={{ xs: 1, sm: 2, md: 3 }} 
              justifyContent="center" 
              alignItems="center"
            >
              <Button
                component={RouterLink}
                to="/CropCorner"
                variant="contained"
                size={isMobile ? "small" : "medium"}
                endIcon={<ShoppingCartIcon />}
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: { xs: 1.5, sm: 4, md: 6, lg: 7 },
                  py: { xs: 0.8, sm: 1.5, md: 2, lg: 2.5 },
                  fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1.2rem' },
                  boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                    transform: 'scale(1.05)',
                    backgroundColor: theme.palette.secondary.dark
                  },
                  width: { xs: '48%', sm: 'auto' }
                }}
              >
                {isMobile ? 'Shop & Earn' : 'Shop Now & Earn Coins'}
              </Button>
              
              <Button
                component={RouterLink}
                to="/faq"
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                startIcon={<AccessTimeIcon />}
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: { xs: 1.5, sm: 4, md: 6, lg: 7 },
                  py: { xs: 0.8, sm: 1.5, md: 2, lg: 2.5 },
                  fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem', lg: '1.2rem' },
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    borderColor: theme.palette.secondary.dark
                  },
                  width: { xs: '48%', sm: 'auto' }
                }}
              >
                {isMobile ? 'Learn' : 'Learn More'}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RewardsPage;