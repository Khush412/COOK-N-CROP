import React from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import SpaIcon from '@mui/icons-material/Spa';
import RestaurantIcon from '@mui/icons-material/Restaurant';

const ProductHighlight = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <AgricultureIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      title: "Farm Fresh",
      description: "Direct from local farms to your table"
    },
    {
      icon: <SpaIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      title: "Sustainable",
      description: "Environmentally responsible sourcing"
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: { xs: 32, sm: 40 } }} />,
      title: "Chef Approved",
      description: "Selected by professional chefs"
    }
  ];

  return (
    <Box sx={{ 
      py: { xs: 4, sm: 6, md: 8 }, 
      bgcolor: 'background.paper',
      borderRadius: { xs: 2, sm: 4 },
      mb: { xs: 3, sm: 6 }
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 2, 
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.primary.main,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Premium Quality Produce
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mb: { xs: 3, sm: 4 }, 
              fontFamily: theme.typography.fontFamily, 
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            We source only the finest ingredients from trusted local farmers
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} alignItems="center" justifyContent="center">
          <Grid item xs={12}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: { xs: 2, sm: 3 }, 
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                }}
              >
                From Farm to Table
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: { xs: 3, sm: 4 }, 
                  fontFamily: theme.typography.fontFamily, 
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  lineHeight: 1.6
                }}
              >
                Our produce is harvested at peak ripeness and delivered to you within 24 hours. 
                We work directly with local farmers who use sustainable practices to ensure you 
                get the freshest, most nutritious ingredients for your meals.
              </Typography>
              
              <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }} justifyContent="center">
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ color: 'secondary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 1, 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              
              <Button
                component={RouterLink}
                to="/CropCorner"
                variant="contained"
                size="large"
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: { xs: 3, sm: 5 }, 
                  py: { xs: 1, sm: 1.5 },
                  boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': { 
                    boxShadow: `0 0 25px ${alpha(theme.palette.primary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'scale(1.05)'
                  },
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                Explore Our Products
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductHighlight;