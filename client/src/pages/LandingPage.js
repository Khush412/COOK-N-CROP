import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, alpha, Snackbar, Alert, Divider, Avatar, Stack, useMediaQuery, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import Slider from 'react-slick';
import { ArrowForward, FormatQuote, MenuBook, LocalShipping, Shield, Timer, EmojiEvents, Verified, Star, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/axios';
import FeaturedProductCard from '../components/FeaturedProductCard';
import ProminentCTA from '../components/ProminentCTA';
import ProductHighlight from '../components/ProductHighlight';
import SeasonalPromo from '../components/SeasonalPromo';
import NewsletterSignup from '../components/NewsletterSignup';
import LoyaltyProgram from '../components/LoyaltyProgram';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
    avatar: `${process.env.PUBLIC_URL}/images/avatars/avatar-1.jpg`,
    rating: 5
  },
  {
    quote: "I love the community aspect. I've discovered so many amazing recipes and made friends who share my passion for food.",
    author: "Samantha Lee",
    role: "Home Chef",
    avatar: `${process.env.PUBLIC_URL}/images/avatars/avatar-2.jpg`,
    rating: 5
  },
  {
    quote: "As a small-scale farmer, Cook'N'Crop has given me a platform to reach customers who truly appreciate quality and sustainability.",
    author: "Michael Chen",
    role: "Local Farmer",
    avatar: `${process.env.PUBLIC_URL}/images/avatars/avatar-3.jpg`,
    rating: 5
  },
];

const LandingPage = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [featuredProducts, setFeaturedProducts] = useState({ loading: true, data: [], error: null });
  const [featuredRecipes, setFeaturedRecipes] = useState({ loading: true, data: [], error: null });

  // To use a fixed set of banner images, use this array.
  // Make sure you place your images in the `public/images/` folder.
  const bannerImages = [
    `${process.env.PUBLIC_URL}/images/hero-banner-image-1.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-2.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-3.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-4.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-5.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-6.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-7.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-8.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-9.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-10.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-11.png`,
    `${process.env.PUBLIC_URL}/images/hero-banner-image-12.png`,
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

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await api.get('/products/featured');
        setFeaturedProducts({ loading: false, data: res.data, error: null });
      } catch (err) {
        setFeaturedProducts({ loading: false, data: [], error: 'Could not load featured products.' });
      }
    };
    fetchFeaturedProducts();

    const fetchFeaturedRecipes = async () => {
      try {
        const res = await api.get('/posts/featured-recipes');
        setFeaturedRecipes({ loading: false, data: res.data, error: null });
      } catch (err) {
        setFeaturedRecipes({ loading: false, data: [], error: 'Could not load featured recipes.' });
      }
    };
    fetchFeaturedRecipes();

  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Trust badges data
  const trustBadges = [
    { icon: <LocalShipping sx={{ fontSize: 40 }} />, title: "Free Delivery", description: "On orders over ₹2000" },
    { icon: <Shield sx={{ fontSize: 40 }} />, title: "100% Secure", description: "Protected payments" },
    { icon: <Timer sx={{ fontSize: 40 }} />, title: "Fresh Guarantee", description: "Delivered within 24 hours" },
    { icon: <EmojiEvents sx={{ fontSize: 40 }} />, title: "Award Winning", description: "Best local produce 2023" },
  ];

  // Enhanced value propositions for hero section
  const valuePropositions = [
    { icon: <Verified sx={{ color: theme.palette.secondary.main }} />, text: "Farm-Fresh Produce" },
    { icon: <Star sx={{ color: theme.palette.secondary.main }} />, text: "Locally Sourced" },
    { icon: <CheckCircle sx={{ color: theme.palette.secondary.main }} />, text: "Quality Guaranteed" },
  ];

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
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <Typography variant="h2" component="h1" sx={{ fontWeight: 800, fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem' }, letterSpacing: '0.03em', textShadow: '0px 3px 8px rgba(0,0,0,0.6)', fontFamily: theme.typography.fontFamily, mb: 2 }}>
                Welcome back, {user?.username}!
              </Typography>
              <Typography variant="h5" component="p" sx={{ mt: 2, opacity: 0.9, textShadow: '0px 2px 5px rgba(0,0,0,0.5)', fontFamily: theme.typography.fontFamily, mb: 4 }}>
                What are we cooking today?
              </Typography>
              
              {/* Value Propositions */}
              <Box sx={{ mt: 3, mb: 4 }}>
                <Grid container spacing={2} justifyContent="center">
                  {valuePropositions.map((prop, index) => (
                    <Grid item key={index} xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {prop.icon}
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                          {prop.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/CropCorner"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily,
                    boxShadow: `0 0 20px ${alpha(theme.palette.secondary.main, 0.7)}, 0 0 35px ${alpha(theme.palette.secondary.main, 0.5)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'scale(1.05)', boxShadow: `0 0 30px ${alpha(theme.palette.secondary.main, 0.9)}, 0 0 50px ${alpha(theme.palette.secondary.main, 0.7)}` }
                  }}
                >
                  Shop Fresh Produce
                </Button>
                <Button
                  component={RouterLink}
                  to="/recipes"
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily,
                    color: '#fff',
                    borderColor: '#fff',
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: theme.palette.secondary.main,
                      color: theme.palette.secondary.main
                    }
                  }}
                >
                  Browse Recipes
                </Button>
              </Stack>
            </motion.div>
          </Container>
        </Box>
      ) : (
        // LOGGED-OUT HERO (Cinematic Video)
        <Box id="home" sx={{ position: 'relative', height: '100vh', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <video autoPlay loop muted playsInline style={{ position: 'absolute', width: '100%', height: '100%', left: '50%', top: '50%', objectFit: 'cover', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
            <source src={isMobile ? `${process.env.PUBLIC_URL}/videos/cinematic_video_mobile.mp4` : `${process.env.PUBLIC_URL}/videos/cinematic_video.mp4`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <Box sx={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 2 }} />
          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 3, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} style={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h1" component="h1" sx={{ fontWeight: 900, fontSize: { xs: '2.5rem', sm: '4rem', md: '5rem' }, letterSpacing: '0.05em', textShadow: '0px 4px 10px rgba(0,0,0,0.7)', fontFamily: theme.typography.fontFamily, mb: 2 }}>
                Cook'N'Crop
              </Typography>
              <Typography variant="h5" component="p" sx={{ mt: 2, opacity: 0.9, textShadow: '0px 2px 5px rgba(0,0,0,0.5)', fontFamily: theme.typography.fontFamily, mb: 2 }}>
                Where Cooking Meets Freshness
              </Typography>
              <Typography variant="h6" component="p" sx={{ mt: 2, opacity: 0.8, fontFamily: theme.typography.fontFamily, maxWidth: '600px', mx: 'auto', mb: 4 }}>
                Discover the freshest local produce, connect with fellow food lovers, and unlock delicious recipes from our vibrant community.
              </Typography>
              
              {/* Value Propositions */}
              <Box sx={{ mt: 3, mb: 4 }}>
                <Grid container spacing={2} justifyContent="center">
                  {valuePropositions.map((prop, index) => (
                    <Grid item key={index} xs={12} sm={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        {prop.icon}
                        <Typography variant="body1" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                          {prop.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button component={RouterLink} to="/login" variant="contained" color="secondary" size="large" endIcon={<ArrowForward />} sx={{ py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily, boxShadow: `0 0 15px ${alpha(theme.palette.secondary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.secondary.main, 0.4)}`, transition: 'box-shadow 0.3s ease', '&:hover': { boxShadow: `0 0 25px ${alpha(theme.palette.secondary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.secondary.main, 0.6)}` } }}>
                  Get Started - Fresh Today
                </Button>
                <Button component={RouterLink} to="/CropCorner" variant="outlined" size="large" sx={{ py: 1.5, px: 5, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: '#fff', borderColor: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main } }}>
                  Browse Products
                </Button>
              </Stack>
            </motion.div>
          </Container>
        </Box>
      )}

      {/* Trust Badges Section */}
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {trustBadges.map((badge, index) => (
              <Grid item xs={6} sm={3} key={index} sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Box sx={{ color: 'secondary.main', mb: 1 }}>
                    {badge.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontFamily: theme.typography.fontFamily }}>
                    {badge.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {badge.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Seasonal Promo Section */}
      <Container maxWidth="lg">
        <SeasonalPromo />
      </Container>

      {/* Product Highlight Section */}
      <Container maxWidth="lg">
        <ProductHighlight />
      </Container>

      {/* Featured Products Section */}
      <AnimatedSection id="featured-products" sx={{ bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily }}>
              Fresh From The Farm
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily, maxWidth: '600px', mx: 'auto' }}>
              Handpicked, locally sourced produce delivered to your doorstep
            </Typography>
            <Divider sx={{ width: '80px', height: '4px', bgcolor: 'secondary.main', mx: 'auto' }} />
          </Box>
          {featuredProducts.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
          ) : featuredProducts.error ? (
            <Alert severity="error">{featuredProducts.error}</Alert>
          ) : (
            <Box sx={{
              '.slick-slide': {
                px: 1.5, // Create spacing between slides
              },
              '.slick-list': {
                mx: -1.5, // Counteract the slide padding
              },
              '.slick-dots li button:before': {
                fontSize: '12px',
                color: theme.palette.primary.main,
              },
              '.slick-dots li.slick-active button:before': {
                color: theme.palette.secondary.main,
              }
            }}>
              <Slider {...{
                dots: true,
                infinite: featuredProducts.data.length > 4,
                speed: 500,
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 4000,
                responsive: [
                  { breakpoint: 1200, settings: { slidesToShow: 3 } },
                  { breakpoint: 900, settings: { slidesToShow: 2 } },
                  { breakpoint: 600, settings: { slidesToShow: 1, arrows: false } }
                ]
              }}>
                {featuredProducts.data.map((product) => (
                  <Box key={product._id} sx={{ height: '100%' }}>
                    <FeaturedProductCard product={product} showSnackbar={showSnackbar} />
                  </Box>
                ))}
              </Slider>
            </Box>
          )}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={RouterLink}
              to="/CropCorner"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px', px: 5, py: 1.5,
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}, 0 0 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                transition: 'box-shadow 0.3s ease',
                '&:hover': { boxShadow: `0 0 25px ${alpha(theme.palette.primary.main, 0.8)}, 0 0 40px ${alpha(theme.palette.primary.main, 0.6)}` }
              }}
            >
              Explore The Full Store
            </Button>
          </Box>
        </Container>
      </AnimatedSection>

      {/* Prominent CTA Section */}
      <Container maxWidth="lg">
        <ProminentCTA />
      </Container>

      {/* Loyalty Program Section */}
      <Container maxWidth="lg">
        <LoyaltyProgram />
      </Container>

      {/* Newsletter Signup Section */}
      <Container maxWidth="lg">
        <NewsletterSignup />
      </Container>

      {/* Testimonials Section */}
      <AnimatedSection
        id="testimonials"
        sx={{
          py: { xs: 10, md: 16 },
          position: 'relative',
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/parallax.png)`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.6)', zIndex: 1 }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily, color: 'white' }}>
              What Our Community Says
            </Typography>
            <Typography variant="h6" color="secondary.main" sx={{ mb: 3, fontFamily: theme.typography.fontFamily, maxWidth: '600px', mx: 'auto' }}>
              Join thousands of happy customers and food enthusiasts
            </Typography>
            <Divider sx={{ width: '80px', height: '4px', bgcolor: 'secondary.main', mx: 'auto' }} />
          </Box>
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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
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
                Join Now - Fresh Starts Here
              </Button>
              <Button
                component={motion.button}
                whileHover={{ scale: 1.1, transition: { type: 'spring', stiffness: 300 } }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/CropCorner')}
                variant="outlined"
                size="large"
                sx={{ py: 1.5, px: 6, borderRadius: '50px', fontWeight: 'bold', fontFamily: theme.typography.fontFamily, color: 'white', borderColor: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main } }}
              >
                Browse Products
              </Button>
            </Stack>
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