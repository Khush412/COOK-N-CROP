import React, { useState, useEffect, useMemo } from 'react';
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
  TextField,
  InputAdornment,
  Pagination,
  Stack,
  Chip,
  FormControl,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';
import {
  FavoriteBorder as FavoriteBorderIcon,
  Search as SearchIcon,
  Sort as SortIcon,
} from '@mui/icons-material';

const WishlistPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [page, setPage] = useState(1);
  const productsPerPage = 6;

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

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = wishlist.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Sorting
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  }, [wishlist, searchTerm, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, page]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePageChange = (event, value) => {
    setPage(value);
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
          <Typography variant="h5" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, mb: 2 }}>
            Your wishlist is empty.
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, fontFamily: theme.typography.fontFamily, mb: 3, maxWidth: 500, mx: 'auto' }}>
            Add products you love to your wishlist to save them for later.
          </Typography>
          <Button component={RouterLink} to="/CropCorner" variant="contained" sx={{ mt: 3, borderRadius: '50px', px: 4, fontFamily: theme.typography.fontFamily }}>
            Explore Products
          </Button>
        </Paper>
      ) : (
        <>
          {/* Filters and Search */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <TextField
                placeholder="Search wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  flex: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: '20px' },
                  '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily }
                }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant={sortOption === 'newest' ? 'contained' : 'outlined'}
                  onClick={() => setSortOption('newest')}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Newest
                </Button>
                <Button
                  variant={sortOption === 'price-low' ? 'contained' : 'outlined'}
                  onClick={() => setSortOption('price-low')}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Price ↑
                </Button>
                <Button
                  variant={sortOption === 'price-high' ? 'contained' : 'outlined'}
                  onClick={() => setSortOption('price-high')}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                    fontSize: '0.875rem'
                  }}
                >
                  Price ↓
                </Button>
              </Stack>
            </Stack>
          </Paper>
          
          {paginatedProducts.length === 0 ? (
            <Paper sx={{ p: { xs: 3, sm: 6 }, textAlign: 'center', mt: 4, borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                No products found matching your search.
              </Typography>
            </Paper>
          ) : (
            <>
              <Grid container spacing={3}>
                {paginatedProducts.filter(p => p).map((product) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
                    <ProductCard product={product} showSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })} />
                  </Grid>
                ))}
              </Grid>
              
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{ 
                      '& .MuiPaginationItem-root': { fontFamily: theme.typography.fontFamily },
                      '& .Mui-selected': { fontWeight: 'bold' }
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </>
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