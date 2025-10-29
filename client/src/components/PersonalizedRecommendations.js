import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Stack,
} from '@mui/material';
import ProductCard from './ProductCard';
import productService from '../services/productService'; // Use productService instead

const PersonalizedRecommendations = ({ showSnackbar }) => {
  const theme = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      
      // Fallback to fetching random products since recommendations endpoint isn't implemented
      const response = await productService.getAllProducts({ 
        page: 1
      });
      
      // Handle both array and object responses
      let products = Array.isArray(response) ? response : (response.products || response.data || []);
      
      // Shuffle and limit to 8 products
      const shuffled = products
        .filter(product => product && product._id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);
      
      setRecommendations(shuffled);
    } catch (err) {
      setError('Failed to load personalized recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <Typography 
          variant="h5" 
          component="h2" 
          fontWeight="bold" 
          sx={{ fontFamily: theme.typography.fontFamily }}
        >
          Recommended For You
        </Typography>
      </Stack>
      
      <Grid container spacing={3}>
        {recommendations.map((product) => (
          product && product._id ? (
            <Grid key={product._id} size={{ xs: 12, sm: 6, md: 3 }}>
              <ProductCard 
                product={product} 
                showSnackbar={showSnackbar} 
                hideCategoryAndUnit={true} // Hide category and unit like recently viewed
                hideQuantitySelector={true} // Hide just the quantity selector
              />
            </Grid>
          ) : null
        ))}
      </Grid>
    </Box>
  );
};

export default PersonalizedRecommendations;