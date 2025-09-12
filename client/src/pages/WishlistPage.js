import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Paper,
  Alert,
  Grid,
  Button,
  Snackbar,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await userService.getWishlist();
        if (res.success) {
          setWishlist(res.data);
        } else {
          throw new Error(res.message || 'Failed to fetch wishlist.');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching your wishlist.');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4, mt: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 4 }}>
        My Wishlist
      </Typography>
      {wishlist.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Your wishlist is empty.
          </Typography>
          <Button component={RouterLink} to="/CropCorner" variant="contained" sx={{ mt: 2 }}>
            Explore Products
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
              <ProductCard product={product} showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })} />
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WishlistPage;