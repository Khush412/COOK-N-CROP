import React from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimerIcon from '@mui/icons-material/Timer';

const SeasonalPromo = () => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      py: 8, 
      bgcolor: alpha(theme.palette.secondary.main, 0.1),
      borderRadius: 4,
      mb: 6,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <Box sx={{ 
        position: 'absolute', 
        top: -20, 
        right: -20, 
        width: 100, 
        height: 100, 
        borderRadius: '50%', 
        bgcolor: alpha(theme.palette.secondary.main, 0.2) 
      }} />
      <Box sx={{ 
        position: 'absolute', 
        bottom: -30, 
        left: -30, 
        width: 150, 
        height: 150, 
        borderRadius: '50%', 
        bgcolor: alpha(theme.palette.primary.main, 0.1) 
      }} />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                <LocalOfferIcon sx={{ fontSize: 40, color: theme.palette.secondary.main, mr: 1 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.secondary.main
                  }}
                >
                  Seasonal Special
                </Typography>
              </Box>
              
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary
                }}
              >
                Summer Harvest Sale
              </Typography>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  mb: 3, 
                  fontFamily: theme.typography.fontFamily, 
                  maxWidth: '600px'
                }}
              >
                Get 25% off on all seasonal fruits and vegetables. Limited time offer - fresh summer produce at unbeatable prices!
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                <TimerIcon sx={{ fontSize: 24, color: theme.palette.error.main, mr: 1 }} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontFamily: theme.typography.fontFamily,
                    color: theme.palette.error.main
                  }}
                >
                  Offer ends in 3 days
                </Typography>
              </Box>
              
              <Button
                component={RouterLink}
                to="/CropCorner"
                variant="contained"
                size="large"
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: 5, 
                  py: 1.5,
                  boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': { 
                    boxShadow: `0 0 25px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.secondary.main, 0.6)}`,
                    transform: 'scale(1.05)'
                  }
                }}
              >
                Shop Summer Harvest
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              boxShadow: 5,
              border: `3px solid ${theme.palette.secondary.main}`,
              height: { xs: '250px', sm: '300px', md: '350px' },
              width: '100%',
              maxWidth: '350px'
            }}>
              <Box
                component="img"
                src={`${process.env.PUBLIC_URL}/images/seasonal-promo.jpg`}
                alt="Seasonal promo"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SeasonalPromo;