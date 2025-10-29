import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import NewsletterSignup from '../components/NewsletterSignup';
import PromotionalCarousel from '../components/PromotionalCarousel'; // Import the PromotionalCarousel component
import CircularGallery from '../custom_components/CircularGallery'; // Import the CircularGallery component
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DomeGallery from '../custom_components/DomeGallery';
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

  return (
    <Box sx={{
      width: '100%',
      bgcolor: 'background.default',
      pt: { xs: 4, sm: 5, md: 6 } // Reduced top padding slightly
    }}
    >
      {/* The global header from App.js will act as the navbar */}
      
      {/* Promotional Carousel */}
      <Box id="home" sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <PromotionalCarousel />
        </Container>
      </Box>

      {/* Featured Products Section - Replaced with CircularGallery */}
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
          
          {/* Fetch featured products and pass them to CircularGallery */}
          <FeaturedProductsGallery />
          
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

      {/* Explore Recipes Section - DomeGallery */}
      <AnimatedSection id="explore-recipes" sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, fontFamily: theme.typography.fontFamily }}>
              Explore Recipes from around the world
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily, maxWidth: '600px', mx: 'auto' }}>
              Discover delicious recipes created by our community of food enthusiasts
            </Typography>
            <Divider sx={{ width: '80px', height: '4px', bgcolor: 'secondary.main', mx: 'auto' }} />
          </Box>
          
          {/* Fetch featured recipes and pass them to DomeGallery */}
          <FeaturedRecipesGallery />
        </Container>
      </AnimatedSection>

      {/* Prominent CTA Section */}
      <Container maxWidth="lg">
        <ProminentCTA />
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

      {/* Newsletter Signup Section - Moved to the end */}
      <Container maxWidth="lg">
        <NewsletterSignup />
      </Container>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Add this component to fetch featured products and pass them to the CircularGallery
const FeaturedProductsGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch all products without a limit
        const res = await api.get('/products?getAll=true');
        
        // Handle array response
        let products = Array.isArray(res.data) ? res.data : [];
        
        // Transform products into gallery items with product IDs
        const galleryItems = products
          .filter(product => {
            // Only include products that have images
            return (product.images && product.images.length > 0) || product.image;
          })
          .map(product => ({
            id: product._id, // Add product ID for click handling
            image: product.images && product.images.length > 0 
              ? `${process.env.REACT_APP_API_URL}${product.images[0]}` 
              : (product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`),
            text: product.name
          }));
        
        setItems(galleryItems);
        setError(null);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
  }

  // If no items, show a message
  if (items.length === 0) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No products available</div>;
  }

  // Use the CircularGallery component with all products
  return (
    <div style={{ height: '500px', position: 'relative' }}>
      <CircularGallery 
        items={items}
        bend={-2} // Changed to -2 for downward curve
        textColor="#808080" // Changed to greyish color for better visibility on both dark and white backgrounds
        borderRadius={0.3}
        font="bold 20px Figtree"
        scrollSpeed={1.5}
        scrollEase={0.05}
        autoScroll={true}
        autoScrollSpeed={0.1}
        height={500}
      />
    </div>
  );
};

// Add this component to fetch featured recipes and pass them to the DomeGallery
const FeaturedRecipesGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        // Try to fetch all posts/recipes
        let res;
        try {
          // First try to get all posts/recipes
          res = await api.get('/posts');
        } catch (err) {
          try {
            // If that fails, try to get most liked recipes
            res = await api.get('/posts/most-liked');
          } catch (err2) {
            // If that also fails, fall back to featured recipes
            res = await api.get('/posts/featured-recipes');
          }
        }
        
        // Check if response data is an array
        let recipes = [];
        if (Array.isArray(res.data)) {
          recipes = res.data;
        } else if (res.data && Array.isArray(res.data.recipes)) {
          // Handle case where data is an object with a recipes array property
          recipes = res.data.recipes;
        } else if (res.data && Array.isArray(res.data.posts)) {
          // Handle case where data is an object with a posts array property
          recipes = res.data.posts;
        } else {
          console.warn('Unexpected data format:', res.data);
          recipes = [];
        }
        
        // Filter posts to only include recipe posts with images
        recipes = recipes.filter(recipe => {
          // Check if it's marked as a recipe
          const isMarkedAsRecipe = recipe.isRecipe === true;
          
          // Check if it has recipe details
          const hasRecipeDetails = recipe.recipeDetails && typeof recipe.recipeDetails === 'object';
          
          // Check if it has media (images)
          const hasMedia = recipe.media && Array.isArray(recipe.media) && recipe.media.length > 0;
          
          // Return true if it's a recipe and has media
          return (isMarkedAsRecipe || hasRecipeDetails) && hasMedia;
        });
        
        // Transform recipes into gallery items with recipe IDs
        // Take a random sample if there are many recipes
        if (recipes.length > 20) {
          // Shuffle and take first 20 for better variety
          recipes = recipes
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
            .slice(0, 20);
        }
        
        // Store the recipes for later use
        window.allRecipes = recipes;
        
        const galleryItems = recipes.map((recipe, index) => {
          // Get the first image from media array
          let imageUrl = `${process.env.PUBLIC_URL}/images/default-recipe.jpg`;
          if (recipe.media && recipe.media.length > 0 && recipe.media[0].url) {
            imageUrl = `${process.env.REACT_APP_API_URL}${recipe.media[0].url}`;
          }
          
          console.log('Processing recipe:', recipe._id || recipe.id, recipe.title); // Debug log
          
          return {
            id: recipe._id || recipe.id, // Add recipe ID for click handling
            src: imageUrl,
            alt: recipe.title || recipe.name || 'Recipe image'
          };
        });
        
        console.log('Gallery items being passed to DomeGallery:', galleryItems); // Debug log
        setItems(galleryItems);
      } catch (err) {
        setError('Failed to load recipes');
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [navigate]);

  // Handle image click to navigate to recipe detail page
  const handleImageClick = (imageData) => {
    console.log('Image clicked:', imageData); // Debug log
    
    // First try to get ID directly
    if (imageData.id) {
      console.log('Navigating to post with direct ID:', imageData.id);
      // Recipes are actually posts in this system, so we use /post/:id route
      navigate(`/post/${imageData.id}`);
      return;
    }
    
    // Fallback: Try to find recipe by matching image URL
    if (imageData.src && window.allRecipes) {
      console.log('Trying to match image URL to recipe:', imageData.src);
      const matchedRecipe = window.allRecipes.find(recipe => {
        if (recipe.media && recipe.media.length > 0 && recipe.media[0].url) {
          const recipeImageUrl = `${process.env.REACT_APP_API_URL}${recipe.media[0].url}`;
          return recipeImageUrl === imageData.src;
        }
        return false;
      });
      
      if (matchedRecipe && (matchedRecipe._id || matchedRecipe.id)) {
        const recipeId = matchedRecipe._id || matchedRecipe.id;
        console.log('Found matching recipe by image URL, navigating to:', recipeId);
        // Recipes are actually posts in this system, so we use /post/:id route
        navigate(`/post/${recipeId}`);
        return;
      }
    }
    
    // Try to extract ID from the URL as a last resort
    const url = imageData.src || '';
    console.log('Trying to extract ID from URL:', url);
    
    // Try different patterns to extract ID from URL
    // Pattern 1: Look for MongoDB ObjectId in the URL path
    const objectIdMatch = url.match(/([0-9a-fA-F]{24})/);
    if (objectIdMatch && objectIdMatch[1]) {
      console.log('Found ObjectId in URL:', objectIdMatch[1]);
      // Recipes are actually posts in this system, so we use /post/:id route
      navigate(`/post/${objectIdMatch[1]}`);
      return;
    }
    
    // Pattern 2: Look for any long alphanumeric string that might be an ID
    const idMatch = url.match(/\/([0-9a-fA-F]{12,})/);
    if (idMatch && idMatch[1]) {
      console.log('Found potential ID in URL:', idMatch[1]);
      // Recipes are actually posts in this system, so we use /post/:id route
      navigate(`/post/${idMatch[1]}`);
      return;
    }
    
    console.log('No valid ID found, opening image viewer');
  };

  if (loading) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>{error}</div>;
  }

  // If no items, show a message
  if (items.length === 0) {
    return <div style={{ height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No recipes available</div>;
  }

  // Use the DomeGallery component with recipes
  return (
    <div style={{ height: '600px', position: 'relative' }}>
      <DomeGallery 
        images={items}
        fit={0.6}
        minRadius={500}
        maxVerticalRotationDeg={10}
        dragSensitivity={15}
        imageBorderRadius="20px"
        openedImageBorderRadius="20px"
        grayscale={false}
        onImageClick={handleImageClick} // Add click handler
        autoRotate={true} // Enable auto-rotation
        autoRotateSpeed={0.2} // Set auto-rotation speed
        showVisualCues={true} // Show visual cues
        overlayBlurColor="transparent" // Make overlay fully transparent
      />
    </div>
  );
};

export default LandingPage;
