import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Divider, Stack, Paper, Chip, LinearProgress } from '@mui/material';
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
      icon: <StarIcon sx={{ fontSize: 36 }} />
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
      icon: <StarIcon sx={{ fontSize: 36 }} />
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
      icon: <StarIcon sx={{ fontSize: 36 }} />
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
      icon: <CurrencyRupeeIcon sx={{ fontSize: 36, color: theme.palette.secondary.main }} />
    },
    {
      title: "Collect & Grow",
      description: "Build your coin balance and unlock higher membership tiers",
      icon: <EmojiEventsIcon sx={{ fontSize: 36, color: theme.palette.secondary.main }} />
    },
    {
      title: "Redeem for Savings",
      description: "Use coins for instant discounts at checkout (max 5% off)",
      icon: <RedeemIcon sx={{ fontSize: 36, color: theme.palette.secondary.main }} />
    },
    {
      title: "Enjoy Benefits",
      description: "Unlock exclusive perks as you progress through membership tiers",
      icon: <StarIcon sx={{ fontSize: 36, color: theme.palette.secondary.main }} />
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
      py: { xs: 4, sm: 6, md: 8 }
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: { xs: 6, md: 8 },
          py: { xs: 4, sm: 6, md: 8 },
          borderRadius: { xs: 2, md: 4 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -30, 
            left: -30, 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.1)
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.primary.main, 0.1)
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: { xs: 60, sm: 80, md: 100 }, color: 'secondary.main', mb: { xs: 2, md: 3 } }} />
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: 800, 
                mb: { xs: 2, md: 3 }, 
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.primary.main,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
              }}
            >
              Harvest Coins Loyalty Program
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 3, md: 4 }, 
                fontFamily: theme.typography.fontFamily, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              Earn Harvest Coins with every purchase and unlock exclusive benefits
            </Typography>
            
            {!user ? (
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 2, sm: 3 }} 
                justifyContent="center" 
                alignItems="center"
                sx={{ mb: 4 }}
              >
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size="large"
                  endIcon={<ShoppingCartIcon />}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 4, sm: 6, md: 7 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                      transform: 'scale(1.05)',
                      backgroundColor: theme.palette.secondary.dark
                    }
                  }}
                >
                  Sign Up & Start Earning
                </Button>
                
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 4, sm: 6, md: 7 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      borderColor: theme.palette.secondary.dark
                    }
                  }}
                >
                  Create Account
                </Button>
              </Stack>
            ) : (
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 2, sm: 3 }} 
                justifyContent="center" 
                alignItems="center"
                sx={{ mb: 4 }}
              >
                <Button
                  component={RouterLink}
                  to="/CropCorner"
                  variant="contained"
                  size="large"
                  endIcon={<ShoppingCartIcon />}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 4, sm: 6, md: 7 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                      transform: 'scale(1.05)',
                      backgroundColor: theme.palette.secondary.dark
                    }
                  }}
                >
                  Start Shopping
                </Button>
                
                <Button
                  component={RouterLink}
                  to="/profile"
                  variant="outlined"
                  size="large"
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    fontWeight: 'bold', 
                    borderRadius: '50px', 
                    px: { xs: 4, sm: 6, md: 7 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                    borderColor: theme.palette.secondary.main,
                    color: theme.palette.secondary.main,
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      borderColor: theme.palette.secondary.dark
                    }
                  }}
                >
                  View My Profile
                </Button>
              </Stack>
            )}
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: { xs: 2, sm: 3 }, 
                bgcolor: alpha(theme.palette.secondary.main, 0.15), 
                borderRadius: { xs: 2, md: 3 }, 
                maxWidth: { xs: '100%', sm: 600, md: 700 }, 
                mx: 'auto',
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 'bold',
                  color: theme.palette.secondary.main,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
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
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              overflow: 'hidden'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <EmojiEventsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily }}>
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
                      height: 32,
                      fontSize: '1rem'
                    }}
                  />
                </Box>
                
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, height: '100%' }}>
                      <Typography variant="h3" fontWeight="bold" color="secondary.main" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                        {harvestCoins.balance}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                        Harvest Coins Balance
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                        <CurrencyRupeeIcon sx={{ fontSize: 24 }} />
                        <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                          {harvestCoins.totalSpent.toFixed(0)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                        Total Spent (₹)
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, height: '100%' }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: 1 }}>
                        {harvestCoins.totalOrders}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                        Total Orders
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, height: '100%' }}>
                      <Typography variant="h3" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: 1, color: 'secondary.main' }}>
                        {harvestCoins.harvestCoinsPercentage}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                        Earning Rate
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Progress to Next Tier */}
                {nextTier && (
                  <Box sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                        Progress to {nextTier.name} Tier
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>
                        {progressToNextTier.toFixed(0)}% Complete
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={progressToNextTier} 
                      sx={{ 
                        height: 12, 
                        borderRadius: 6,
                        bgcolor: alpha(theme.palette.divider, 0.3),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.secondary.main
                        }
                      }} 
                    />
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, color: 'secondary.main' }}>
                              ₹{harvestCoins.totalSpent.toFixed(0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              Spent of ₹{nextTier.minSpent.toLocaleString()}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, (harvestCoins.totalSpent / nextTier.minSpent) * 100)} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                mt: 1,
                                bgcolor: alpha(theme.palette.divider, 0.3),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: theme.palette.primary.main
                                }
                              }} 
                            />
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600, color: 'secondary.main' }}>
                              {harvestCoins.totalOrders}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                              Orders of {nextTier.minOrders}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={Math.min(100, (harvestCoins.totalOrders / nextTier.minOrders) * 100)} 
                              sx={{ 
                                height: 6, 
                                borderRadius: 3,
                                mt: 1,
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Chip 
                        label={currentTier.name} 
                        sx={{ 
                          bgcolor: currentTier.color, 
                          color: currentTier.name === 'Gold' ? 'black' : 'white',
                          fontWeight: 'bold',
                          height: 24
                        }} 
                      />
                      <Chip 
                        label={nextTier.name} 
                        sx={{ 
                          bgcolor: nextTier.color, 
                          color: nextTier.name === 'Gold' ? 'black' : 'white',
                          fontWeight: 'bold',
                          height: 24
                        }} 
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        {/* How It Works */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: { xs: 4, md: 6 }, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
            }}
          >
            How Harvest Coins Work
          </Typography>
          
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {howItWorksSteps.map((step, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'center',
                  borderRadius: { xs: 2, md: 3 },
                  boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.08)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.15)}`
                  },
                  p: { xs: 2, sm: 3 },
                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                }}>
                  <Box sx={{ 
                    width: { xs: 60, sm: 70 }, 
                    height: { xs: 60, sm: 70 }, 
                    borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: { xs: 2, sm: 3 }
                  }}>
                    {step.icon}
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 0, '&:last-child': { pb: 0 } }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold', 
                        mb: 2, 
                        fontFamily: theme.typography.fontFamily,
                        color: 'secondary.main',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        color: 'text.secondary',
                        fontSize: { xs: '0.85rem', sm: '0.95rem' }
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

        <Divider sx={{ my: { xs: 4, md: 6 } }} />

        {/* Membership Tiers */}
        <Box sx={{ mb: { xs: 6, md: 8 } }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800, 
              mb: { xs: 3, sm: 4 }, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
            }}
          >
            Membership Tiers
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 4, md: 6 }, 
              fontFamily: theme.typography.fontFamily, 
              textAlign: 'center',
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '0.95rem', sm: '1.1rem' }
            }}
          >
            Unlock more benefits as you earn more Harvest Coins
          </Typography>
          
          <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
            {tiers.map((tier, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center',
                    borderRadius: { xs: 2, md: 3 },
                    boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.1)}`,
                    p: { xs: 2, sm: 3 },
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
                      top: 8, 
                      right: 8, 
                      bgcolor: theme.palette.secondary.main, 
                      color: 'white',
                      px: 1, 
                      py: 0.5, 
                      fontSize: '0.7rem', 
                      fontWeight: 'bold',
                      borderRadius: 1
                    }}>
                      YOUR TIER
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    width: { xs: 50, sm: 60 }, 
                    height: { xs: 50, sm: 60 }, 
                    borderRadius: '50%', 
                    bgcolor: alpha(tier.color, 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: tier.color
                  }}>
                    {tier.icon}
                  </Box>
                  
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 1, 
                      fontFamily: theme.typography.fontFamily,
                      color: tier.color
                    }}
                  >
                    {tier.name}
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 2, 
                      fontFamily: theme.typography.fontFamily,
                      color: 'text.primary'
                    }}
                  >
                    Requirements
                  </Typography>
                  
                  <List sx={{ textAlign: 'left', mb: 2, px: 1 }}>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon sx={{ 
                          fontSize: 16, 
                          color: tier.color 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`₹${tier.minSpent.toLocaleString()}+ spent`}
                        primaryTypographyProps={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.75rem', sm: '0.85rem' },
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ py: 0.5, px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon sx={{ 
                          fontSize: 16, 
                          color: tier.color 
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={`${tier.minOrders}+ orders`}
                        primaryTypographyProps={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.75rem', sm: '0.85rem' },
                          color: 'text.secondary'
                        }}
                      />
                    </ListItem>
                  </List>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'bold', 
                      mb: 2, 
                      fontFamily: theme.typography.fontFamily,
                      color: 'text.primary'
                    }}
                  >
                    Benefits
                  </Typography>
                  
                  <List sx={{ textAlign: 'left', mb: 2, px: 1 }}>
                    {tier.benefits.map((benefit, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircleIcon sx={{ 
                            fontSize: 16, 
                            color: tier.color 
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          primaryTypographyProps={{ 
                            fontFamily: theme.typography.fontFamily,
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
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
          py: { xs: 6, md: 10 },
          borderRadius: { xs: 2, md: 4 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -30, 
            left: -30, 
            width: 100, 
            height: 100, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.1),
            opacity: 0.5
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -50, 
            right: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            opacity: 0.5
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 4 } }}>
            <StarIcon sx={{ fontSize: { xs: 60, sm: 80 }, color: 'secondary.main', mb: { xs: 3, sm: 4 } }} />
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: { xs: 3, sm: 4 }, 
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.primary,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
              }}
            >
              Ready to Start Earning?
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                mb: { xs: 4, sm: 5 }, 
                fontFamily: theme.typography.fontFamily, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
              }}
            >
              Join thousands of satisfied customers who are already enjoying the benefits of Harvest Coins
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 2, sm: 3 }} 
              justifyContent="center" 
              alignItems="center"
            >
              <Button
                component={RouterLink}
                to="/CropCorner"
                variant="contained"
                size="large"
                endIcon={<ShoppingCartIcon />}
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: { xs: 4, sm: 6, md: 7 },
                  py: { xs: 1.5, sm: 2, md: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  boxShadow: `0 6px 20px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    boxShadow: `0 8px 30px ${alpha(theme.palette.secondary.main, 0.6)}`,
                    transform: 'scale(1.05)',
                    backgroundColor: theme.palette.secondary.dark
                  }
                }}
              >
                Shop Now & Earn Coins
              </Button>
              
              <Button
                component={RouterLink}
                to="/faq"
                variant="outlined"
                size="large"
                startIcon={<AccessTimeIcon />}
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: { xs: 4, sm: 6, md: 7 },
                  py: { xs: 1.5, sm: 2, md: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  borderColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.main,
                  '&:hover': { 
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    borderColor: theme.palette.secondary.dark
                  }
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RewardsPage;