import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  Button,
  Divider,
  IconButton,
  Drawer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert,
  Skeleton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  useTheme,
  Pagination,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import recentlyViewedService from '../services/recentlyViewedService';
import Slider from 'react-slick';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

export default function CropCorner() {
  const theme = useTheme();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortOrder, setSortOrder] = useState('default');

  // Debounced filter states for API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 100]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const isFilterApplied = useMemo(() => {
    return (
      searchTerm !== '' ||
      selectedCategory !== 'All' ||
      priceRange[0] !== 0 ||
      priceRange[1] !== 100 ||
      sortOrder !== 'default'
    );
  }, [searchTerm, selectedCategory, priceRange, sortOrder]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce price range
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
      setPage(1); // Reset to page 1 on price change
    }, 500);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Main data fetching effect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts({
          page,
          search: debouncedSearchTerm,
          category: selectedCategory,
          minPrice: debouncedPriceRange[0],
          maxPrice: debouncedPriceRange[1],
          sort: sortOrder,
        });
        setProducts(data.products);
        setTotalPages(data.pages);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Fetch recently viewed products from local storage
    setRecentlyViewed(recentlyViewedService.getProducts());
  }, [page, debouncedSearchTerm, selectedCategory, debouncedPriceRange, sortOrder]);

  // Reset page when category or sort order changes directly
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortOrder]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange([0, 100]);
    setSortOrder('default');
    setPage(1);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const filterContent = (
    <Box sx={{ width: '100%', p: { xs: 2, md: 0 }, pt: { xs: 2, md: 0 }, fontFamily: theme.typography.fontFamily }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 700 }}>Filters</Typography>
        {isFilterApplied && (
          <Button
            size="small"
            startIcon={<ClearIcon fontSize="small" />}
            onClick={handleClearFilters}
            sx={{ fontFamily: theme.typography.fontFamily, textTransform: 'none' }}
          >
            Clear All
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>Category</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <FormControlLabel value="All" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>All</Typography>} />
              {categories.map((category) => (
                <FormControlLabel key={category} value={category} control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{category}</Typography>} />
              ))}
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Slider value={priceRange} onChange={(e, newValue) => setPriceRange(newValue)} valueLabelDisplay="auto" min={0} max={100} sx={{ mt: 2, mb: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>${priceRange[0]}</Typography>
            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>${priceRange[1]}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 12, py: 4 }}>
      <Paper sx={{
        position: 'relative',
        p: { xs: 3, md: 5 },
        mb: 4,
        borderRadius: 4,
        color: '#fff',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/CooknCrop.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5)',
          zIndex: 1,
        },
        '&::after': { // Overlay
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 2,
        }
      }}>
        <Box sx={{ position: 'relative', zIndex: 3 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, fontFamily: theme.typography.fontFamily, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            The Store
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: theme.typography.fontFamily, opacity: 0.9, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
            Freshness delivered from our fields to your kitchen.
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Desktop Filter Sidebar */} {/* Use size prop */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, position: 'sticky', top: 100 }}>
            {filterContent}
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid size={{ xs: 12, md: 9 }}> {/* Use size prop */}
          <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', borderRadius: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
              }}
              sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 250 }, '& .MuiOutlinedInput-root': { borderRadius: '20px' }, '& .MuiInputBase-input': { fontFamily: theme.typography.fontFamily } }}
              InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</InputLabel>
              <Select value={sortOrder} label="Sort By" onChange={(e) => setSortOrder(e.target.value)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>
                <MenuItem value="default" sx={{ fontFamily: theme.typography.fontFamily }}>Default</MenuItem>
                <MenuItem value="priceAsc" sx={{ fontFamily: theme.typography.fontFamily }}>Price: Low to High</MenuItem>
                <MenuItem value="priceDesc" sx={{ fontFamily: theme.typography.fontFamily }}>Price: High to Low</MenuItem>
                <MenuItem value="nameAsc" sx={{ fontFamily: theme.typography.fontFamily }}>Name: A-Z</MenuItem>
                <MenuItem value="nameDesc" sx={{ fontFamily: theme.typography.fontFamily }}>Name: Z-A</MenuItem>
              </Select>
            </FormControl>
            <IconButton onClick={handleDrawerToggle} sx={{ display: { xs: 'flex', md: 'none' } }}>
              <MenuIcon />
            </IconButton>
          </Paper>

          {loading ? (
            <Grid container spacing={4}>
              {[...Array(8)].map((_, index) => ( 
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}> {/* Use size prop */}
                  <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
                  <Skeleton />
                  <Skeleton width="60%" />
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Typography color="error" sx={{ textAlign: 'center', mt: 4, fontFamily: theme.typography.fontFamily }}>
              {error}
            </Typography>
          ) : products.length === 0 ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                No products found matching your criteria.
              </Typography>
              <Button onClick={handleClearFilters} sx={{ mt: 2, fontFamily: theme.typography.fontFamily }}>
                Reset Filters
              </Button>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {products.map((product) => (
                <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProductCard product={product} showSnackbar={showSnackbar} />
                </Grid>
              ))}
            </Grid>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, pb: 4 }}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
            </Box>
          )}

          {/* Recently Viewed Section */}
          {recentlyViewed.length > 0 && (
            <Box sx={{ mt: 8 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon />
                <Typography variant="h5" component="h2" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily }}>
                  Recently Viewed
                </Typography>
              </Stack>
              <Divider sx={{ mb: 4 }} />
              <Grid container spacing={4}> {/* Use size prop */}
                {recentlyViewed.slice(0, 4).map((product) => ( // Show up to 4 recently viewed items
                  <Grid key={`recent-${product._id}`} size={{ xs: 12, sm: 6, md: 3 }}>
                    <ProductCard product={product} showSnackbar={showSnackbar} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

        </Grid>
      </Grid>

      {/* Mobile Filter Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 } }}
      >
        {filterContent}
      </Drawer>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}