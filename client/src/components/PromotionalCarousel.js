import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const PromotionalCarousel = () => {
  const theme = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef();

  const slides = [
    {
      title: "Summer Harvest Sale",
      subtitle: "Fresh seasonal produce at unbeatable prices",
      description: "Get 15% off on all seasonal fruits and vegetables. Limited time offer - stock up on the best of summer!",
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
      image: `${process.env.PUBLIC_URL}/images/chefspecial.png`
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

  // Handle auto-rotation with progress bar
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Simple counter to track progress updates
    let progressCounter = 0;
    const totalUpdates = 100; // We want 100 updates to reach 100%
    const updateInterval = 50; // Update every 50ms
    
    intervalRef.current = setInterval(() => {
      progressCounter += 1;
      setProgress((progressCounter / totalUpdates) * 100);
      
      if (progressCounter >= totalUpdates) {
        // Move to next slide
        setCurrentSlide(prevSlide => {
          const nextSlide = (prevSlide + 1) % slides.length;
          return nextSlide;
        });
        // Reset counter for next cycle
        progressCounter = 0;
      }
    }, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      borderRadius: 4,
      mb: 0,
      boxShadow: 5,
      border: `2px solid ${theme.palette.secondary.main}`
    }}>
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
          p: { xs: 4, md: 8 }
        }}
      >
        <Box sx={{ 
          maxWidth: { xs: '100%', md: '55%' },
          color: 'white'
        }}>
          <Typography 
            variant="h1"
            component="h2"
            sx={{ 
              fontWeight: 800, 
              mb: 1.5, 
              fontFamily: theme.typography.fontFamily,
              textShadow: '2px 2px 6px rgba(0,0,0,0.9)',
              fontSize: { xs: '1.25rem', sm: '2rem', md: '3.5rem' }
            }}
          >
            {slides[currentSlide].title}
          </Typography>
          
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 600, 
              mb: 1.5,
              fontFamily: theme.typography.fontFamily,
              textShadow: '1px 1px 4px rgba(0,0,0,0.9)',
              color: theme.palette.secondary.main,
              fontSize: { xs: '1rem', sm: '1.25rem', md: '2rem' }
            }}
          >
            {slides[currentSlide].subtitle}
          </Typography>
          
          <Typography 
            variant="h6"
            sx={{ 
              mb: 2,
              fontFamily: theme.typography.fontFamily,
              maxWidth: '650px',
              textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
              lineHeight: 1.5,
              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.25rem' }
            }}
          >
            {slides[currentSlide].description}
          </Typography>
          
          <Button
            component={RouterLink}
            to={slides[currentSlide].ctaLink}
            variant="contained"
            size="medium"
            sx={{ 
              fontFamily: theme.typography.fontFamily, 
              fontWeight: 'bold', 
              borderRadius: '50px', 
              px: { xs: 2.5, sm: 3.5, md: 5 },
              py: { xs: 1, sm: 1.5, md: 2 },
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1.1rem' },
              boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                transform: 'scale(1.05)',
                backgroundColor: theme.palette.secondary.dark
              }
            }}
          >
            {slides[currentSlide].ctaText}
          </Button>
        </Box>
      </Box>
      
      {/* Animated line indicators like Flipkart */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 30, 
        left: '50%', 
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 1,
        zIndex: 10
      }}>
        {slides.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleDotClick(index)}
            sx={{
              width: 24,
              height: 3,
              borderRadius: 1,
              bgcolor: index === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.6)'
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                height: '100%',
                width: index === currentSlide ? `${progress}%` : '0%',
                bgcolor: theme.palette.secondary.main,
                left: 0,
                top: 0,
                transition: index === currentSlide ? 'width 0.05s linear' : 'none'
              }}
            />
          </Box>
        ))}
      </Box>
      
      {/* Navigation arrows */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: 20, 
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <Box
          onClick={() => handleDotClick((currentSlide - 1 + slides.length) % slides.length)}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Box>
      </Box>
      
      <Box 
        sx={{ 
          position: 'absolute', 
          top: '50%', 
          right: 20, 
          transform: 'translateY(-50%)',
          zIndex: 10,
          display: { xs: 'none', sm: 'block' }
        }}
      >
        <Box
          onClick={() => handleDotClick((currentSlide + 1) % slides.length)}
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.3)',
              transform: 'scale(1.1)'
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Box>
      </Box>
    </Box>
  );
};

export default PromotionalCarousel;