import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, alpha, Snackbar, Alert, Divider, Avatar, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { ArrowForward, People, FormatQuote, MenuBook, Storefront } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

// Reusable component for animated sections
const AnimatedSection = React.forwardRef(({ children, sx = {}, id }, ref) => {
  // If no ref is passed from the parent, we still need one for useInView to work.
  const internalRef = useRef(null);
  const targetRef = ref || internalRef;

  return (
    <Box
      ref={targetRef}
      id={id}
      sx={{ py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden', ...sx }}
    >
      {children}
    </Box>
  );
});

const TESTIMONIALS = [
  {
    quote: "The freshness of the produce is unparalleled. It's like having a farmer's market at my doorstep. My cooking has never been better!",
    author: "Alex Johnson",
    role: "Professional Chef",
    avatar: "/images/avatars/avatar-1.jpg",
  },
  {
    quote: "I love the community aspect. I've discovered so many amazing recipes and made friends who share my passion for food.",
    author: "Samantha Lee",
    role: "Home Chef",
    avatar: "/images/avatars/avatar-2.jpg",
  },
  {
    quote: "As a small-scale farmer, Cook'N'Crop has given me a platform to reach customers who truly appreciate quality and sustainability.",
    author: "Michael Chen",
    role: "Local Farmer",
    avatar: "/images/avatars/avatar-3.jpg",
  },
];

const LandingPage = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // To use a fixed set of banner images, use this array.
  // Make sure you place your images in the `public/images/` folder.
  const bannerImages = [
    '/images/hero-banner-image-1.png',
    '/images/hero-banner-image-2.png',
    '/images/hero-banner-image-3.png',
    '/images/hero-banner-image-4.png',
    '/images/hero-banner-image-5.png',
    '/images/hero-banner-image-6.png',
    '/images/hero-banner-image-7.png',
    '/images/hero-banner-image-8.png',
    '/images/hero-banner-image-9.png',
    '/images/hero-banner-image-10.png',
    '/images/hero-banner-image-11.png',
    '/images/hero-banner-image-12.png',
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated && bannerImages.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
      }, 7000); // Change image every 7 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, bannerImages.length]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{
      width: '100%',
      bgcolor: 'background.default',
    }}
    >
      {/* The global header from App.js will act as the navbar */}
      
      {/* Hero Section - Conditional Rendering */}
      {isAuthenticated ? (
        // LOGGED-IN HERO
        <Box
          id="home"
          sx={{
            position: 'relative',
            height: '100vh', // Full viewport height
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: theme.palette.grey[900], // Fallback background
          }}
        >
          {bannerImages.length > 0 && (
            <AnimatePresence>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${bannerImages[currentImageIndex]})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  zIndex: 1,
                }}
              />
            </AnimatePresence>
          )}
          <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.45)', zIndex: 2 }} />
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3, color: '#fff' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            >
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, letterSpacing: '0.03em', textShadow: '0px 3px 8px rgba(0,0,0,0.6)', fontFamily: theme.typography.fontFamily }}>
                Welcome back, {user?.username}!
              </Typography>
              <Typography variant="h5" component="p" sx={{ mt: 2, opacity: 0.9, textShadow: '0px 2px 5px rgba(0,0,0,0.5)', fontFamily: theme.typography.fontFamily }}>
                What are we cooking today?
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/recipes"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily,
                    boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    transition: 'box-shadow 0.3s ease',
                    '&:hover': { boxShadow: `0 0 25px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.secondary.main, 0.6)}` }
                  }}
                >
                  Explore Recipes
                </Button>
                <Button
                  component={RouterLink}
                  to="/CropCorner"
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily,
                    color: 'white', borderColor: alpha(theme.palette.common.white, 0.5),
                    '&:hover': { borderColor: 'white', backgroundColor: alpha(theme.palette.common.white, 0.1) }
                  }}
                >
                  Explore Store
                </Button>
              </Stack>
            </motion.div>
          </Container>
        </Box>
      ) : (
        // LOGGED-OUT HERO (Cinematic Video)
        <Box id="home" sx={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <video autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', left: '50%', top: '50%', objectFit: 'cover', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
            <source src="/videos/cinematic_video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 2 }} />
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3, color: '#fff' }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}>
              <Typography variant="h1" component="h1" sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' }, letterSpacing: '0.05em', textShadow: '0px 4px 10px rgba(0,0,0,0.7)', fontFamily: theme.typography.fontFamily }}>
                Cook'N'Crop
              </Typography>
              <Typography variant="h5" component="p" sx={{ mt: 2, opacity: 0.9, textShadow: '0px 2px 5px rgba(0,0,0,0.5)', fontFamily: theme.typography.fontFamily }}>
                Where Cooking Meets Freshness
              </Typography>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />} sx={{ mt: 4, py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily, boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.secondary.main, 0.4)}`, transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: `0 0 25px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.secondary.main, 0.6)}` } }}>
                Get Started
              </Button>
            </motion.div>
          </Container>
        </Box>
      )}

      {/* Explore Section */}
      <AnimatedSection id="explore" sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" textAlign="center" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily }}>
            Explore Our World
          </Typography>
          <Divider sx={{ width: '80px', height: '4px', bgcolor: 'secondary.main', mx: 'auto', mb: 8 }} />
          <Grid container spacing={4} justifyContent="center">
            {[
              { title: 'Community Hub', description: 'Connect with fellow food lovers, share tips, and join discussions.', icon: <People fontSize="large" />, path: '/community' },
              { title: 'Recipe Collection', description: 'Discover thousands of recipes from home cooks and professional chefs.', icon: <MenuBook fontSize="large" />, path: '/recipes' },
              { title: 'Fresh Marketplace', description: 'Shop for the freshest seasonal ingredients delivered to your door.', icon: <Storefront fontSize="large" />, path: '/CropCorner' },
            ].map((step, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index} sx={{ display: 'flex' }}>
                <Paper
                  component={motion.div}
                  whileHover={{ y: -10, boxShadow: theme.shadows[12] }}
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(step.path)}
                >
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 80, height: 80, mb: 3, color: 'primary.main' }}>
                    {step.icon}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 1.5, fontFamily: theme.typography.fontFamily }}>{step.title}</Typography>
                  <Typography color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, flexGrow: 1 }}>{step.description}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedSection>

      {/* Testimonials Section */}
      <AnimatedSection
        id="testimonials"
        sx={{
          py: { xs: 10, md: 16 },
          position: 'relative',
          backgroundImage: 'url(/images/hero1.png)',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1 }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" textAlign="center" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily, color: 'white' }}>
            What Our Community Says
          </Typography>
          <Divider sx={{ width: '80px', height: '4px', bgcolor: 'secondary.main', mx: 'auto', mb: 8 }} />
          <Grid container spacing={4}>
            {TESTIMONIALS.map((testimonial, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index} sx={{ display: 'flex' }}>
                <Paper
                  component={motion.div}
                  whileHover={{ y: -8, boxShadow: theme.shadows[10] }}
                  sx={{
                    p: 4, height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.85),
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <FormatQuote sx={{ fontSize: 48, color: 'secondary.main', transform: 'rotate(180deg)', alignSelf: 'center' }} />
                  <Typography variant="body1" sx={{ fontStyle: 'italic', flexGrow: 1, my: 2, color: 'text.secondary', fontFamily: theme.typography.fontFamily }}>
                    {testimonial.quote}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 2 }}>
                    <Avatar src={testimonial.avatar} alt={testimonial.author} sx={{ width: 56, height: 56 }} />
                    <Box textAlign="left">
                      <Typography fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.primary' }}>{testimonial.author}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>{testimonial.role}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Join CTA merged into parallax section */}
          <Box sx={{ mt: 12, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, fontFamily: theme.typography.fontFamily, color: 'white' }}>
              Join the Cook'n'Crop Family
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 500, mb: 4, fontFamily: theme.typography.fontFamily, color: 'secondary.main' }}>
              <TypeAnimation
                sequence={['Share. Cook. Enjoy.', 2000, 'Share. Cook. Connect.', 2000]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </Typography>
            <Button
              component={motion.button}
              whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 300 } }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(isAuthenticated ? '/community' : '/login')}
              variant="contained"
              color="secondary"
              size="large"
              sx={{ py: 1.5, px: 6, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}
            >
              Join Now
            </Button>
          </Box>
        </Container>
      </AnimatedSection>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LandingPage;