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
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const WishlistPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
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
      <Container maxWidth="md" sx={{ py: 4, mt: 12 }}>
        <Alert severity="error" sx={{ fontFamily: theme.typography.fontFamily }}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 4, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily }}>
          My Wishlist
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
          Your favorite products, all in one place.
        </Typography>
      </Paper>
      {wishlist.length === 0 ? (
        <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.secondary.main, 0.02)})` }}>
          <FavoriteBorderIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
            Your wishlist is empty.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily }}>
            Add products you love to your wishlist to save them for later.
          </Typography>
          <Button component={RouterLink} to="/CropCorner" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Explore Products
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {wishlist.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
              <ProductCard product={product} showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })} />
            </Grid>
          ))}
        </Grid>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WishlistPage;