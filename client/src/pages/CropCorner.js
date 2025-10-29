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
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import recentlyViewedService from '../services/recentlyViewedService';
import Slider from 'react-slick';
import { Slider as MuiSlider } from '@mui/material';
import EnhancedSearch from '../components/EnhancedSearch';
import PersonalizedRecommendations from '../components/PersonalizedRecommendations';
import PersonalizedOffers from '../components/PersonalizedOffers';
import { useAuth } from '../contexts/AuthContext';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

export default function CropCorner() {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [uniqueTags, setUniqueTags] = useState([]); // For storing tags from database

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [minRating, setMinRating] = useState(0); // Add this line for rating filter

  // Debounced filter states for API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 10000]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const isFilterApplied = useMemo(() => {
    return (
      searchTerm !== '' ||
      selectedCategory !== 'All' ||
      sortOrder !== 'default' ||
      stockFilter !== 'all' ||
      (priceRange[0] !== 0 || priceRange[1] !== 10000) ||
      selectedTags.length > 0
    );
  }, [searchTerm, selectedCategory, sortOrder, stockFilter, priceRange, selectedTags]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce price range filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Fetch unique tags from database
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await productService.getUniqueTags();
        setUniqueTags(tags);
      } catch (err) {
        console.error('Failed to fetch tags:', err);
        // Fallback to some default tags if API fails
        setUniqueTags(['Organic', 'Gluten-Free', 'Vegan', 'Non-GMO', 'Local', 'Seasonal']);
      }
    };

    fetchTags();
  }, []);

  // Main data fetching effect
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts({
          page,
          search: debouncedSearchTerm,
          category: selectedCategory,
          sort: sortOrder,
          stockFilter: stockFilter,
          minPrice: debouncedPriceRange[0],
          maxPrice: debouncedPriceRange[1],
          tags: selectedTags,
          minRating: minRating, // Add this line
        });
        // Filter out any null products
        const validProducts = data.products.filter(product => product && product._id);
        setProducts(validProducts);
        setTotalPages(data.pages);
      } catch (err) {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Fetch recently viewed products from local storage
    const storedRecentlyViewed = recentlyViewedService.getProducts();
    // Filter out any null products
    const validRecentlyViewed = storedRecentlyViewed.filter(product => product && product._id);
    setRecentlyViewed(validRecentlyViewed);
  }, [page, debouncedSearchTerm, selectedCategory, sortOrder, stockFilter, debouncedPriceRange, selectedTags, minRating]); // Add minRating to dependency array

  // Reset page when category or sort order changes directly
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, sortOrder, stockFilter, minRating]); // Add minRating to dependency array

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSortOrder('default');
    setStockFilter('all');
    setPriceRange([0, 10000]);
    setSelectedTags([]);
    setMinRating(0); // Add this line
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

  // New function to handle search submission
  const handleSearchSubmit = (searchValue) => {
    setSearchTerm(searchValue || searchTerm);
    setPage(1);
  };

  // New function to handle coupon application
  const handleApplyCoupon = (couponCode) => {
    showSnackbar(`Coupon ${couponCode} applied!`, 'success');
  };

  const filterContent = (
    <Box sx={{ 
      width: '100%', 
      p: { xs: 2, md: 0 }, 
      pt: { xs: 2, md: 0 }, 
      fontFamily: theme.typography.fontFamily,
      maxHeight: { md: 'calc(100vh - 120px)' },
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '3px',
        visibility: 'hidden',
      },
      '&:hover::-webkit-scrollbar-thumb': {
        visibility: 'visible',
      },
      scrollbarWidth: 'thin',
      scrollbarColor: 'rgba(0,0,0,0.2) transparent',
    }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MuiSlider
              value={priceRange}
              onChange={(e, newValue) => setPriceRange(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextField
                label="Min Price"
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                size="small"
                sx={{ width: '45%' }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
              <TextField
                label="Max Price"
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                size="small"
                sx={{ width: '45%' }}
                InputLabelProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
                inputProps={{ sx: { fontFamily: theme.typography.fontFamily } }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>Tags</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {uniqueTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                color={selectedTags.includes(tag) ? 'primary' : 'default'}
                variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                sx={{ fontFamily: theme.typography.fontFamily }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider />

      <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>Availability</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <FormControlLabel 
                value="all" 
                control={<Radio size="small" />} 
                label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>All Products</Typography>} 
              />
              <FormControlLabel 
                value="inStock" 
                control={<Radio size="small" />} 
                label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>In Stock Only</Typography>} 
              />
              <FormControlLabel 
                value="onSale" 
                control={<Radio size="small" />} 
                label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>On Sale</Typography>} 
              />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Divider />

      {/* Add this new Accordion for Rating filter */}
      <Accordion sx={{ boxShadow: 'none', bgcolor: 'transparent', '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 600 }}>Minimum Rating</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <MuiSlider
              value={minRating}
              onChange={(e, newValue) => setMinRating(newValue)}
              valueLabelDisplay="auto"
              min={0}
              max={5}
              step={0.5}
              marks={[
                { value: 0, label: '0★' },
                { value: 1, label: '1★' },
                { value: 2, label: '2★' },
                { value: 3, label: '3★' },
                { value: 4, label: '4★' },
                { value: 5, label: '5★' },
              ]}
            />
            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily, textAlign: 'center' }}>
              {minRating === 0 ? 'Show all ratings' : `Show ${minRating}★ & above`}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ mb: 2 }} />
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 12, py: 4 }}>
      <Grid container spacing={4}>
        {/* Desktop Filter Sidebar */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 3, position: 'sticky', top: 100 }}>
            {filterContent}
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: 300, md: 400 } }}>
                <EnhancedSearch 
                  searchTerm={searchTerm} 
                  setSearchTerm={setSearchTerm} 
                  onSearchSubmit={handleSearchSubmit}
                />
              </Box>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</InputLabel>
                <Select value={sortOrder} label="Sort By" onChange={(e) => setSortOrder(e.target.value)} sx={{ fontFamily: theme.typography.fontFamily, borderRadius: 2 }}>
                  <MenuItem value="default" sx={{ fontFamily: theme.typography.fontFamily }}>Default (Featured)</MenuItem>
                  <MenuItem value="priceAsc" sx={{ fontFamily: theme.typography.fontFamily }}>Price: Low to High</MenuItem>
                  <MenuItem value="priceDesc" sx={{ fontFamily: theme.typography.fontFamily }}>Price: High to Low</MenuItem>
                  <MenuItem value="rating" sx={{ fontFamily: theme.typography.fontFamily }}>Highest Rated</MenuItem>
                  <MenuItem value="newest" sx={{ fontFamily: theme.typography.fontFamily }}>Newest First</MenuItem>
                  <MenuItem value="nameAsc" sx={{ fontFamily: theme.typography.fontFamily }}>Name: A-Z</MenuItem>
                  <MenuItem value="nameDesc" sx={{ fontFamily: theme.typography.fontFamily }}>Name: Z-A</MenuItem>
                </Select>
              </FormControl>
              <IconButton onClick={handleDrawerToggle} sx={{ display: { xs: 'flex', md: 'none' } }}>
                <MenuIcon />
              </IconButton>
            </Box>
          </Paper>

          {loading ? (
            <Grid container spacing={4}>
              {[...Array(8)].map((_, index) => ( 
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
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
            <>
              <Grid container spacing={4}>
                {products.map((product) => (
                  product && product._id ? ( // Add null check for products
                    <Grid key={product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ProductCard product={product} showSnackbar={showSnackbar} />
                    </Grid>
                  ) : null
                ))}
              </Grid>
              
              {/* Pagination Controls - Moved before Recommended For You */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, pb: 4 }}>
                  <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
                </Box>
              )}
              
              {/* Personalized Recommendations */}
              {isAuthenticated && (
                <PersonalizedRecommendations showSnackbar={showSnackbar} />
              )}
            </>
          )}

          {/* Recently Viewed Section - Styled like Recommended For You */}
          {recentlyViewed.length > 0 && (
            <Box sx={{ mt: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <HistoryIcon />
                <Typography 
                  variant="h5" 
                  component="h2" 
                  fontWeight="bold" 
                  sx={{ fontFamily: theme.typography.fontFamily }}
                >
                  Recently Viewed
                </Typography>
              </Stack>
              
              <Grid container spacing={4}>
                {recentlyViewed.slice(0, 4).map((product) => (
                  product && product._id ? ( // Add null check for recently viewed products
                    <Grid key={`recent-${product._id}`} size={{ xs: 12, sm: 6, md: 3 }}>
                      <ProductCard product={product} showSnackbar={showSnackbar} hideCategoryAndUnit={true} />
                    </Grid>
                  ) : null
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