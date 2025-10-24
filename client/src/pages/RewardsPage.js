import React from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid, Card, CardContent, CardMedia, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PercentIcon from '@mui/icons-material/Percent';
import RedeemIcon from '@mui/icons-material/Redeem';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

const RewardsPage = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: <PercentIcon sx={{ fontSize: 40 }} />,
      title: "Up to 5% Off Every Order",
      description: "Maximum discount using Harvest Coins"
    },
    {
      icon: <CardGiftcardIcon sx={{ fontSize: 40 }} />,
      title: "Birthday Rewards",
      description: "Special gifts on your birthday"
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: "Early Access",
      description: "Be first to new products"
    }
  ];

  const howItWorks = [
    "Earn 2% Harvest Coins based on your total order value",
    "Redeem coins for discounts and special rewards",
    "Enjoy exclusive member-only benefits",
    "Automatic enrollment after 10 orders"
  ];

  return (
    <Box sx={{ 
      width: '100%',
      bgcolor: 'background.default',
      py: 8
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ 
          textAlign: 'center', 
          mb: 8,
          py: 6,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.secondary.main, 0.1),
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            position: 'absolute', 
            top: -50, 
            left: -50, 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.secondary.main, 0.1) 
          }} />
          <Box sx={{ 
            position: 'absolute', 
            bottom: -80, 
            right: -80, 
            width: 300, 
            height: 300, 
            borderRadius: '50%', 
            bgcolor: alpha(theme.palette.primary.main, 0.1) 
          }} />
          
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mb: 2, 
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.primary.main
              }}
            >
              Harvest Coins Loyalty Program
            </Typography>
            <Typography 
              variant="h5" 
              color="text.secondary" 
              sx={{ 
                mb: 4, 
                fontFamily: theme.typography.fontFamily, 
                maxWidth: '700px', 
                mx: 'auto' 
              }}
            >
              Earn Harvest Coins with every purchase and unlock exclusive benefits
            </Typography>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 'bold',
                  color: theme.palette.secondary.main
                }}
              >
                {user?.role === 'admin' 
                  ? 'As an admin, you can earn and use Harvest Coins on all orders!' 
                  : 'You\'re automatically enrolled in the Harvest Coins program after 10 orders!'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* How It Works */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 4, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}
          >
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            {howItWorks.map((step, index) => (
              <Grid item xs={12} md={3} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-8px)' }
                }}>
                  <CardContent>
                    <Box sx={{ 
                      width: 60, 
                      height: 60, 
                      borderRadius: '50%', 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        {index + 1}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                      {step}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Benefits */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 2, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}
          >
            Member Benefits
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: 6, 
              fontFamily: theme.typography.fontFamily, 
              textAlign: 'center',
              maxWidth: '600px', 
              mx: 'auto' 
            }}
          >
            Enjoy exclusive perks just for being a part of our Harvest Coins program
          </Typography>
          
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <Card sx={{ 
                  height: '100%', 
                  textAlign: 'center',
                  borderRadius: 3,
                  boxShadow: 3,
                  p: 3
                }}>
                  <Box sx={{ color: 'secondary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontFamily: theme.typography.fontFamily }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Points System */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 4, 
              fontFamily: theme.typography.fontFamily,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}
          >
            Harvest Coins System
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={`${process.env.PUBLIC_URL}/images/loyalty-program.jpg`}
                  alt="Harvest Coins system"
                  sx={{ objectFit: 'cover' }}
                />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.text.primary
                  }}
                >
                  Earn & Redeem Harvest Coins
                </Typography>
                
                <List sx={{ mb: 3 }}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Earn 2% Harvest Coins on total order value" 
                      secondary="Get coins for every purchase"
                      primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="200 coins = ₹100 off" 
                      secondary="Redeem coins for discounts"
                      primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="500 coins = ₹300 off" 
                      secondary="Better rewards for loyal customers"
                      primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircleIcon sx={{ color: 'secondary.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="1000 coins = ₹700 off" 
                      secondary="Maximum 5% discount on orders"
                      primaryTypographyProps={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }}
                      secondaryTypographyProps={{ fontFamily: theme.typography.fontFamily }}
                    />
                  </ListItem>
                </List>
                
                <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 'bold',
                      color: theme.palette.secondary.main
                    }}
                  >
                    You're automatically enrolled in the Harvest Coins program after 10 orders!
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <ShoppingCartIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 2, 
                fontFamily: theme.typography.fontFamily,
                color: theme.palette.text.primary
              }}
            >
              Ready to Start Earning?
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: 4, 
                fontFamily: theme.typography.fontFamily, 
                maxWidth: '600px', 
                mx: 'auto' 
              }}
            >
              Make purchases to earn Harvest Coins and enjoy exclusive benefits with every order
            </Typography>
            <Box sx={{ p: 2, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2, maxWidth: 600, mx: 'auto' }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 'bold',
                  color: theme.palette.secondary.main
                }}
              >
                You're automatically enrolled in the Harvest Coins program after 10 orders!
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default RewardsPage;