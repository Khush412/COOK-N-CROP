import React from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const ProminentCTA = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      title: "Free Shipping",
      description: "On orders over ₹200"
    },
    {
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      title: "Award Winning",
      description: "Best local produce 2023"
    },
    {
      icon: <SupportAgentIcon sx={{ fontSize: 40 }} />,
      title: "24/7 Support",
      description: "We're here to help"
    }
  ];

  return (
    <Box sx={{ 
      py: 8, 
      bgcolor: alpha(theme.palette.primary.main, 0.05),
      borderRadius: 4,
      mb: 6
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 2, 
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.primary.main
            }}
          >
            Why Choose Cook'N'Crop?
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
            Experience the difference with our premium service and quality guarantee
          </Typography>
        </Box>
        
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={4} justifyContent="center">
            {benefits.map((benefit, index) => (
              <Grid size={{ xs: 12, sm: 4 }} key={index}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
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
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 3, 
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.text.primary
            }}
          >
            Ready to Experience Freshness?
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
            Join thousands of satisfied customers enjoying the best local produce
          </Typography>
          <Button
            component={RouterLink}
            to="/CropCorner"
            variant="contained"
            size="large"
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              fontWeight: 'bold', 
              borderRadius: '50px', 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              boxShadow: `0 0 20px ${alpha(theme.palette.secondary.main, 0.6)}, 0 0 30px ${alpha(theme.palette.secondary.main, 0.4)}`,
              transition: 'box-shadow 0.3s ease',
              '&:hover': { 
                boxShadow: `0 0 30px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 45px ${alpha(theme.palette.secondary.main, 0.6)}`,
                transform: 'scale(1.05)'
              }
            }}
          >
            Shop Fresh Produce Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProminentCTA;