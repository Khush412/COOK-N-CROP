import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PromotionalCarousel = () => {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Summer Harvest Sale",
      subtitle: "Fresh seasonal produce at unbeatable prices",
      description: "Get 25% off on all seasonal fruits and vegetables. Limited time offer - stock up on the best of summer!",
      ctaText: "Shop Summer Harvest",
      ctaLink: "/CropCorner",
      image: `${process.env.PUBLIC_URL}/images/seasonal-promo.jpg`
    },
    {
      title: "New Organic Collection",
      subtitle: "Pure, pesticide-free goodness",
      description: "Discover our premium organic range - farm-fresh produce without any chemicals. Taste the difference nature intended.",
      ctaText: "Explore Organic",
      ctaLink: "/CropCorner?category=organic",
      image: `${process.env.PUBLIC_URL}/images/fresh-produce.jpg`
    },
    {
      title: "Chef's Special Picks",
      subtitle: "Handpicked by culinary experts",
      description: "Our chefs have selected the finest ingredients for your kitchen. Premium quality produce for exceptional meals.",
      ctaText: "See Chef's Picks",
      ctaLink: "/CropCorner?collection=chefs-choice",
      image: `${process.env.PUBLIC_URL}/images/hero-banner-image-1.png`
    },
    {
      title: "Harvest Coins Rewards",
      subtitle: "Earn points with every purchase",
      description: "Join our loyalty program and earn Harvest Coins with every order. Redeem for discounts and exclusive offers!",
      ctaText: "Join Rewards",
      ctaLink: "/rewards",
      image: `${process.env.PUBLIC_URL}/images/loyalty-program.jpg`
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      height: '100%', // Changed to 100% to fill container
      width: '100%', // Ensure full width
      overflow: 'hidden',
      borderRadius: 4,
      mb: 0, // Removed margin bottom
      boxShadow: 5, // Enhanced shadow for more depth
      border: `2px solid ${theme.palette.secondary.main}` // Added border for more professional look
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Background with enhanced gradient overlay for better text readability */}
          <Box 
            sx={{ 
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 35%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0) 100%), url(${slides[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }} 
          />
          
          {/* Content with improved positioning and styling */}
          <Box 
            sx={{ 
              position: 'relative',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              p: { xs: 4, md: 8 } // Increased padding for better spacing
            }}
          >
            <Box sx={{ 
              maxWidth: { xs: '100%', md: '55%' }, // Slightly increased content width
              color: 'white'
            }}>
              <Typography 
                variant="h1" // Increased heading size for more impact
                component="h2"
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  fontFamily: theme.typography.fontFamily,
                  textShadow: '2px 2px 6px rgba(0,0,0,0.9)', // Enhanced text shadow
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' } // Responsive font sizing
                }}
              >
                {slides[currentSlide].title}
              </Typography>
              
              <Typography 
                variant="h4" // Increased subtitle size
                sx={{ 
                  fontWeight: 600, 
                  mb: 3, // Increased margin for better spacing
                  fontFamily: theme.typography.fontFamily,
                  textShadow: '1px 1px 4px rgba(0,0,0,0.9)',
                  color: theme.palette.secondary.main // Added accent color
                }}
              >
                {slides[currentSlide].subtitle}
              </Typography>
              
              <Typography 
                variant="h6" // Increased description size
                sx={{ 
                  mb: 5, // Increased margin for better spacing
                  fontFamily: theme.typography.fontFamily,
                  maxWidth: '650px', // Slightly increased max width
                  textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
                  lineHeight: 1.6 // Improved line height for readability
                }}
              >
                {slides[currentSlide].description}
              </Typography>
              
              <Button
                component={RouterLink}
                to={slides[currentSlide].ctaLink}
                variant="contained"
                size="large"
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  fontWeight: 'bold', 
                  borderRadius: '50px', 
                  px: 5, // Increased padding
                  py: 2, // Increased padding
                  fontSize: '1.1rem', // Larger font size
                  boxShadow: '0 6px 25px rgba(0,0,0,0.4)', // Enhanced shadow
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    boxShadow: '0 8px 30px rgba(0,0,0,0.5)', // Enhanced hover shadow
                    transform: 'scale(1.05)',
                    backgroundColor: theme.palette.secondary.dark // Darker hover effect
                  }
                }}
              >
                {slides[currentSlide].ctaText}
              </Button>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation dots with improved styling */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 30, // Moved dots higher for better positioning
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2, // Increased gap between dots
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleDotClick(index)}
            sx={{
              width: 16, // Larger dots
              height: 16, // Larger dots
              borderRadius: '50%',
              bgcolor: index === currentSlide ? theme.palette.secondary.main : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: index === currentSlide ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent', // Added border for active dot
              '&:hover': {
                bgcolor: index === currentSlide ? theme.palette.secondary.main : 'rgba(255,255,255,0.8)',
                transform: 'scale(1.3)' // Larger hover effect
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PromotionalCarousel;