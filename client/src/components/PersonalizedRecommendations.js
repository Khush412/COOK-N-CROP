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
import userService from '../services/userService';

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
      const response = await userService.getRecommendations();
      setRecommendations(response.data || []);
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
      
      <Grid container spacing={4}>
        {recommendations.map((product) => (
          <Grid key={product._id} size={{ xs: 12, sm: 6, md: 3 }}>
            <ProductCard product={product} showSnackbar={showSnackbar} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PersonalizedRecommendations;