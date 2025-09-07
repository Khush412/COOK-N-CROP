import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Paper,
  TextField,
  InputAdornment,
  FormControl,
  Slider,
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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';

const categories = ['Fruits', 'Vegetables', 'Dairy', 'Grains', 'Meat', 'Seafood', 'Baked Goods', 'Beverages', 'Snacks', 'Other'];

export default function CropCorner() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortOrder, setSortOrder] = useState('default');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAllProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load products. Please try again.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange([0, 100]);
    setSortOrder('default');
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

  const filteredAndSortedProducts = products
    .filter((product) => {
      const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      if (sortOrder === 'priceAsc') {
        return a.price - b.price;
      } else if (sortOrder === 'priceDesc') {
        return b.price - a.price;
      } else if (sortOrder === 'nameAsc') {
        return a.name.localeCompare(b.name);
      } else if (sortOrder === 'nameDesc') {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

  const filterContent = (
    <Box sx={{ width: 250, p: 2, pt: 0, fontFamily: theme.typography.fontFamily }}>
      <Typography variant="h6" gutterBottom sx={{ fontFamily: theme.typography.fontFamily, pl: 1 }}>Filters</Typography>
      <Divider sx={{ mb: 2 }} />

      <Accordion sx={{ mb: 2, boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pl: 1 }}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Category</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: 1 }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <FormControlLabel value="All" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>All</Typography>} />
              {categories.map((category) => (
                <FormControlLabel
                  key={category}
                  value={category}
                  control={<Radio size="small" />}
                  label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{category}</Typography>}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2, boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pl: 1 }}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: 1 }}>
          <Slider
            value={priceRange}
            onChange={(e, newValue) => setPriceRange(newValue)}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            sx={{ mt: 2, mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>${priceRange[0]}</Typography>
            <Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>${priceRange[1]}</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mb: 2, boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ pl: 1 }}>
          <Typography sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pl: 1 }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <FormControlLabel value="default" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Default</Typography>} />
              <FormControlLabel value="priceAsc" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Price: Low to High</Typography>} />
              <FormControlLabel value="priceDesc" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Price: High to Low</Typography>} />
              <FormControlLabel value="nameAsc" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Name: A-Z</Typography>} />
              <FormControlLabel value="nameDesc" control={<Radio size="small" />} label={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>Name: Z-A</Typography>} />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={handleClearFilters}
        fullWidth
        sx={{ mt: 2, fontFamily: theme.typography.fontFamily, ml: 1 }}
      >
        Clear Filters
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', pt: { xs: 8, sm: 10 }, flexDirection: isMobile ? 'column' : 'row' }}>
      {/* Mobile Filter Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {filterContent}
      </Drawer>

      {/* Desktop Filter Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 300,
          flexShrink: 0,
        }}
      >
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 100 }}>
          {filterContent}
        </Paper>
      </Box>

      <Container maxWidth="lg" sx={{ flexGrow: 1 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
            <Typography variant="h5" component="h1" fontWeight="bold" sx={{ fontFamily: theme.typography.fontFamily, mb: isMobile ? 2 : 0 }}>Our Products</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: isMobile ? '100%' : 'auto', fontFamily: theme.typography.fontFamily }}
              />
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Grid container spacing={4}>
            {[...Array(8)].map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
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
        ) : filteredAndSortedProducts.length === 0 ? (
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
            {filteredAndSortedProducts.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                <ProductCard product={product} showSnackbar={showSnackbar} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%', fontFamily: theme.typography.fontFamily }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}