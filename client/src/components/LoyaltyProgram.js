import React from 'react';
import { Box, Typography, Button, Container, useTheme, alpha, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PercentIcon from '@mui/icons-material/Percent';

const LoyaltyProgram = () => {
  const theme = useTheme();

  const benefits = [
    {
      icon: <PercentIcon sx={{ fontSize: 40 }} />,
      title: "10% Off Every Order",
      description: "Exclusive discount for members"
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

  return (
    <Box sx={{ 
      py: 8, 
      bgcolor: 'background.paper',
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
            Cook'N'Crop Rewards
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
            Earn points with every purchase and unlock exclusive benefits
          </Typography>
        </Box>
        
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <Box sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                boxShadow: 5,
                border: `3px solid ${theme.palette.secondary.main}`,
                height: { xs: '200px', sm: '250px', md: '300px' }, // Reduced size
                width: '100%',
                maxWidth: '400px' // Reduced size
              }}>
                <Box
                  component="img"
                  src={`${process.env.PUBLIC_URL}/images/loyalty-program.jpg`}
                  alt="Loyalty program"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary
                }}
              >
                Earn Rewards With Every Purchase
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  fontFamily: theme.typography.fontFamily, 
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                Join our loyalty program and start earning points with every purchase. 
                Redeem your points for discounts, exclusive products, and special experiences. 
                The more you shop, the more you save!
              </Typography>
              
              <Grid container spacing={3} sx={{ mb: 4 }} justifyContent="center">
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ color: 'secondary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
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
              
              <Button
                component={RouterLink}
                to="/rewards"
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
                Join Rewards Program
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LoyaltyProgram;