import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  Box,
  Container,
  Typography,
  Alert,
  Grid,
  Paper,
  Button,
  Divider,
  List,
  Stack,
  Avatar,
  TextField,
  Snackbar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ImageList,
  ImageListItem,
  Breadcrumbs,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ThumbUpIcon from '@mui/icons-material/ThumbUp'; 
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SecurityIcon from '@mui/icons-material/Security';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ShareIcon from '@mui/icons-material/Share';
import userService from '../services/userService';
import productService from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import Rating from '../components/Rating';
import recentlyViewedService from '../services/recentlyViewedService';
import ProductCard from '../components/ProductCard';
import ProductAlerts from '../components/ProductAlerts';
import Loader from '../custom_components/Loader';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, isAuthenticated, updateUserWishlist } = useAuth();
  
  // Create a ref for the slider
  const sliderRef = useRef(null);

  // Custom arrow components for the slider
  const NextArrow = ({ onClick, ...rest }) => {
    const { className, style, currentSlide, slideCount, ...props } = rest;
    return (
      <IconButton 
        {...props}
        onClick={onClick}
        sx={{ 
          position: 'absolute', 
          right: 16, 
          top: '50%', 
          transform: 'translateY(-50%)',
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          '&:hover': { 
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            transform: 'translateY(-50%) scale(1.1)'
          },
          transition: 'all 0.2s ease',
          width: 40,
          height: 40,
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <ArrowForwardIosIcon sx={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }} />
      </IconButton>
    );
  };

  const PrevArrow = ({ onClick, ...rest }) => {
    const { className, style, currentSlide, slideCount, ...props } = rest;
    return (
      <IconButton 
        {...props}
        onClick={onClick}
        sx={{ 
          position: 'absolute', 
          left: 16, 
          top: '50%', 
          transform: 'translateY(-50%)',
          zIndex: 10,
          bgcolor: 'rgba(255, 255, 255, 0.7)',
          '&:hover': { 
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            transform: 'translateY(-50%) scale(1.1)'
          },
          transition: 'all 0.2s ease',
          width: 40,
          height: 40,
          borderRadius: '50%',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(4px)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <ArrowBackIosIcon sx={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.7)' }} />
      </IconButton>
    );
  };

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState(null);

  const [quantityInCart, setQuantityInCart] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [upvotingReviewId, setUpvotingReviewId] = useState(null);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [filterRating, setFilterRating] = useState(0); // 0 for all
  const [sortOption, setSortOption] = useState('newest'); // 'newest' or 'helpful'

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setProduct(data);

      // Add to recently viewed
      if (data) {
        recentlyViewedService.addProduct(data);
      }

      // After product loads, check cart status if user is logged in
      if (isAuthenticated) {
        try {
          const cartData = await productService.getCart();
          const itemInCart = cartData.items.find(item => item.product._id === id);
          setQuantityInCart(itemInCart ? itemInCart.quantity : 0);
        } catch (cartError) {
          console.error("Failed to fetch cart status:", cartError);
          // Don't block product page from rendering if cart fails
        }
      }

      // Fetch related products
      try {
        const relatedData = await productService.getRelatedProducts(id);
        setRelatedProducts(relatedData);
      } catch (relatedError) {
        console.error("Failed to fetch related products:", relatedError);
        // Don't block page render if this fails, just log the error.
      }
    } catch (err) {
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchProduct();
  }, [id, fetchProduct]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setReviewError('Please select a rating.');
      return;
    }
    setReviewLoading(true);
    setReviewError('');
    try {
      await productService.createProductReview(id, { rating, comment });
      setSnackbar({ open: true, message: 'Review submitted successfully!' });
      setRating(0);
      setComment('');
      fetchProduct(); // Re-fetch product to show new review
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReviewUpvote = async (reviewId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    if (upvotingReviewId) return;

    setUpvotingReviewId(reviewId);

    const originalProduct = JSON.parse(JSON.stringify(product));
    const reviewIndex = product.reviews.findIndex(r => r._id === reviewId);
    if (reviewIndex === -1) return;

    // Optimistically update the UI
    const updatedReviews = [...product.reviews];
    const hasUpvoted = updatedReviews[reviewIndex].upvotes.includes(user.id);
    
    if (hasUpvoted) {
      updatedReviews[reviewIndex].upvotes = updatedReviews[reviewIndex].upvotes.filter(id => id !== user.id);
    } else {
      updatedReviews[reviewIndex].upvotes.push(user.id);
    }
    
    updatedReviews[reviewIndex].upvoteCount = updatedReviews[reviewIndex].upvotes.length;
    
    setProduct(prev => ({
      ...prev,
      reviews: updatedReviews
    }));

    try {
      await productService.upvoteProductReview(reviewId);
    } catch (err) {
      // Revert on error
      setProduct(originalProduct);
      setSnackbar({ open: true, message: 'Failed to update vote.' });
    } finally {
      setUpvotingReviewId(null);
    }
  };

  // Share product functionality
  const handleShareProduct = async () => {
    const productUrl = `${window.location.origin}/product/${id}`;
    
    try {
      if (navigator.share) {
        // Use Web Share API if available
        await navigator.share({
          title: product.name,
          text: `Check out this product: ${product.name}`,
          url: productUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(productUrl);
        setSnackbar({ open: true, message: 'Product link copied to clipboard!' });
      }
    } catch (err) {
      // Fallback: copy to clipboard if Web Share fails
      try {
        await navigator.clipboard.writeText(productUrl);
        setSnackbar({ open: true, message: 'Product link copied to clipboard!' });
      } catch (clipboardErr) {
        setSnackbar({ open: true, message: 'Failed to share product. Please try again.' });
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    setIsFavoriting(true);
    try {
      const res = await userService.toggleWishlist(id);
      if (res.success) {
        updateUserWishlist(res.wishlist);
        setSnackbar({ open: true, message: res.message });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update wishlist.' });
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleAddToCart = async (qty) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    setCartLoading(true);
    try {
      await productService.addToCart(id, qty);
      setQuantityInCart(qty);
      setSnackbar({ open: true, message: `${product.name} added to cart!` });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add to cart.' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!isAuthenticated) return;
    if (newQuantity > product.countInStock) {
      setSnackbar({ open: true, message: `Only ${product.countInStock} of ${product.name} available.` });
      return;
    }
    setCartLoading(true);
    try {
      if (newQuantity > 0) {
        await productService.updateCartItemQuantity(id, newQuantity);
        setQuantityInCart(newQuantity);
      } else {
        await productService.removeCartItem(id);
        setQuantityInCart(0);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to update cart.' });
    } finally {
      setCartLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredAndSortedReviews = useMemo(() => {
    if (!product || !product.reviews) return [];
    
    let filtered = product.reviews;
    if (filterRating > 0) {
      filtered = filtered.filter(review => review.rating === filterRating);
    }
    
    return filtered.sort((a, b) => {
      if (sortOption === 'helpful') {
        return (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
  }, [product, filterRating, sortOption]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Loader size="medium" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
        <Alert severity="warning">Product not found.</Alert>
      </Container>
    );
  }

  // Calculate effective price (sale price if on sale, otherwise regular price)
  const effectivePrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  // Slider settings for product images
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    arrows: true,
    draggable: true,
    swipe: true,
    accessibility: true,
    lazyLoad: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: false
        }
      }
    ]
  };
  
  // Function to handle thumbnail click
  const handleThumbnailClick = (index) => {
    // Check if sliderRef is properly attached and has the method
    if (sliderRef.current) {
      // Try different ways to access the slickGoTo method
      if (typeof sliderRef.current.slickGoTo === 'function') {
        sliderRef.current.slickGoTo(index);
      } else if (sliderRef.current.innerSlider && typeof sliderRef.current.innerSlider.slickGoTo === 'function') {
        sliderRef.current.innerSlider.slickGoTo(index);
      } else {
        console.warn('Slider navigation not available:', sliderRef.current);
      }
    } else {
      console.warn('Slider reference not available');
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 12, py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        aria-label="breadcrumb" 
        sx={{ mb: 3 }}
        separator={<NavigateNextIcon fontSize="small" />}
      >
        <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
          Home
        </RouterLink>
        <RouterLink to="/CropCorner" style={{ textDecoration: 'none', color: 'inherit' }}>
          Store
        </RouterLink>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 3 }}>
        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid size={{ xs: 12, md: 6 }}>
            {product.images && product.images.length > 0 ? (
              <>
                <Slider {...sliderSettings} ref={sliderRef}>
                  {product.images.map((image, index) => (
                    <Box key={index} sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
                      <Box
                        component="img"
                        src={`${process.env.REACT_APP_API_URL}${image}`}
                        alt={`${product.name} ${index + 1}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '115%', // Make image taller
                          objectFit: 'cover',
                          objectPosition: 'center top',
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  ))}
                </Slider>
                
                {/* Thumbnail gallery for multiple images */}
                {product.images.length > 1 && (
                  <ImageList 
                    sx={{ 
                      mt: 2, 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr)) !important',
                      gap: '12px !important',
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      '&::-webkit-scrollbar': {
                        height: 6,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: 3,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.3)',
                        }
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: 'transparent',
                      }
                    }} 
                    cols={5} 
                    gap={12}
                  >
                    {product.images.map((image, index) => (
                      <ImageListItem 
                        key={index} 
                        sx={{ 
                          borderRadius: 1, 
                          overflow: 'hidden',
                          border: '2px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            transform: 'scale(1.05)',
                          }
                        }}
                        onClick={() => handleThumbnailClick(index)}
                      >
                        <Box
                          component="img"
                          src={`${process.env.REACT_APP_API_URL}${image}`}
                          alt={`Thumbnail ${index + 1}`}
                          sx={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </>
            ) : (
              <Box sx={{ position: 'relative', pt: '100%', bgcolor: 'grey.200', borderRadius: 2 }}>
                <Box
                  component="img"
                  src={`${process.env.PUBLIC_URL}/images/placeholder.png`}
                  alt={product.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
              </Box>
            )}
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <Box>
                <Typography 
                  variant="overline" 
                  color="primary" 
                  sx={{ 
                    fontWeight: 600, 
                    fontFamily: theme.typography.fontFamily,
                    letterSpacing: 1.2,
                    textTransform: 'uppercase'
                  }}
                >
                  {product.category}
                </Typography>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    fontFamily: theme.typography.fontFamily,
                    mt: 0.5,
                    lineHeight: 1.2
                  }}
                >
                  {product.name}
                </Typography>
              </Box>

              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Rating value={product.rating} readOnly size="small" />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily,
                    fontWeight: 500
                  }}
                >
                  {product.rating.toFixed(1)}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  ({product.numReviews} reviews)
                </Typography>
              </Stack>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  {hasDiscount && (
                    <Typography 
                      variant="h4" 
                      color="text.secondary" 
                      sx={{ 
                        fontWeight: 600, 
                        fontFamily: theme.typography.fontFamily, 
                        textDecoration: 'line-through',
                        display: 'inline'
                      }}
                    >
                      ₹{product.price.toFixed(2)}
                    </Typography>
                  )}
                  <Typography 
                    variant="h2" 
                    color={hasDiscount ? 'error' : 'primary'} 
                    sx={{ 
                      fontWeight: 800, 
                      fontFamily: theme.typography.fontFamily, 
                      ml: hasDiscount ? 1 : 0,
                      display: 'inline'
                    }}
                  >
                    ₹{effectivePrice.toFixed(2)}
                  </Typography>
                </Box>
                {hasDiscount && (
                  <Chip 
                    label={`Save ${discountPercent}%`} 
                    color="error" 
                    size="medium" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: '32px'
                    }}
                  />
                )}
              </Box>

              {product.unit && (
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    fontFamily: theme.typography.fontFamily 
                  }}
                >
                  {` / ${product.unit}`}
                </Typography>
              )}

              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  whiteSpace: 'pre-line',
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                {product.description}
              </Typography>

              {/* Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {product.badges?.isNew && (
                  <Chip 
                    icon={<NewReleasesIcon />} 
                    label="New" 
                    color="info" 
                    size="small" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: '28px'
                    }}
                  />
                )}
                {product.badges?.isOrganic && (
                  <Chip 
                    icon={<LocalFloristIcon />} 
                    label="Organic" 
                    color="success" 
                    size="small" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: '28px'
                    }}
                  />
                )}
                {product.badges?.isBestseller && (
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label="Bestseller" 
                    color="warning" 
                    size="small" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: '28px'
                    }}
                  />
                )}
                {product.badges?.isOnSale && (
                  <Chip 
                    icon={<LocalOfferIcon />} 
                    label="On Sale" 
                    color="error" 
                    size="small" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: '28px'
                    }}
                  />
                )}
                {product.isFeatured && (
                  <Chip 
                    icon={<FlashOnIcon />} 
                    label="Featured" 
                    color="secondary" 
                    size="small" 
                    sx={{ 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      height: '28px'
                    }}
                  />
                )}
              </Stack>

              {/* Stock Status */}
              <Box>
                {product.countInStock > 0 ? (
                  <Chip 
                    label="In Stock" 
                    color="success" 
                    variant="outlined" 
                    size="medium" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: '32px'
                    }}
                  />
                ) : (
                  <Chip 
                    label="Out of Stock" 
                    color="error" 
                    size="medium" 
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      height: '32px'
                    }}
                  />
                )}
              </Box>

              {/* Add to Cart / Wishlist */}
              <Box sx={{ mt: 2 }}>
                {product.countInStock > 0 ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    {quantityInCart > 0 ? (
                      <Stack 
                        direction="row" 
                        spacing={1} 
                        alignItems="center" 
                        sx={{ 
                          border: `2px solid ${theme.palette.divider}`, 
                          borderRadius: 3,
                          px: 1.5,
                          py: 0.5
                        }}
                      >
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(Math.max(0, quantityInCart - 1))}
                          disabled={cartLoading}
                          sx={{ 
                            width: 40, 
                            height: 40 
                          }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography 
                          sx={{ 
                            fontFamily: theme.typography.fontFamily, 
                            minWidth: 40, 
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: '1.1rem'
                          }}
                        >
                          {quantityInCart}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => handleUpdateQuantity(quantityInCart + 1)}
                          disabled={cartLoading || quantityInCart >= product.countInStock}
                          sx={{ 
                            width: 40, 
                            height: 40 
                          }}
                        >
                          <AddIcon />
                        </IconButton>
                      </Stack>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => handleAddToCart(1)}
                        disabled={cartLoading}
                        sx={{ 
                          borderRadius: 3, 
                          px: { xs: 2, sm: 4 }, 
                          py: 1.5,
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 700,
                          textTransform: 'none',
                          flexGrow: { xs: 1, sm: 0 },
                          boxShadow: 3,
                          '&:hover': {
                            boxShadow: 5
                          }
                        }}
                      >
                        {cartLoading ? <Loader size="small" color="inherit" /> : 'Add to Cart'}
                      </Button>
                    )}
                    <Tooltip title={user?.wishlist?.includes(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}>
                      <IconButton 
                        onClick={handleToggleWishlist}
                        disabled={isFavoriting}
                        sx={{ 
                          border: `2px solid ${theme.palette.divider}`,
                          borderRadius: 3,
                          width: 50,
                          height: 50
                        }}
                      >
                        {user?.wishlist?.includes(product._id) ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    {/* Share Product Button */}
                    <Tooltip title="Share Product">
                      <IconButton 
                        onClick={handleShareProduct}
                        sx={{ 
                          border: `2px solid ${theme.palette.divider}`,
                          borderRadius: 3,
                          width: 50,
                          height: 50
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>

                  </Stack>
                ) : (
                  <ProductAlerts productId={product._id} productName={product.name} />
                )}
              </Box>

              {/* Product Info */}
              <Box sx={{ mt: 3 }}>
                <Accordion 
                  sx={{ 
                    boxShadow: 'none', 
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    '&:before': { display: 'none' }
                  }}
                  defaultExpanded
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      minHeight: 48,
                      '&.Mui-expanded': { minHeight: 48 }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 700,
                        fontSize: '1.1rem'
                      }}
                    >
                      Product Information
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                        <strong>Category:</strong> {product.category}
                      </Typography>
                      {product.brand && (
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                          <strong>Brand:</strong> {product.brand}
                        </Typography>
                      )}
                      {product.unit && (
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                          <strong>Unit:</strong> {product.unit}
                        </Typography>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
                
                <Accordion 
                  sx={{ 
                    boxShadow: 'none', 
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                    mt: 1
                  }}
                >
                  <AccordionSummary 
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      minHeight: 48,
                      '&.Mui-expanded': { minHeight: 48 }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily, 
                        fontWeight: 700,
                        fontSize: '1.1rem'
                      }}
                    >
                      Shipping & Returns
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <LocalShippingIcon color="primary" sx={{ fontSize: '1.8rem' }} />
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                          Free shipping on orders over ₹200
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <SecurityIcon color="primary" sx={{ fontSize: '1.8rem' }} />
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                          Secure payment options
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <AutorenewIcon color="primary" sx={{ fontSize: '1.8rem' }} />
                        <Typography variant="body1" sx={{ fontFamily: theme.typography.fontFamily }}>
                          1-day return policy
                        </Typography>
                      </Stack>

                    </Stack>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        {/* Reviews Section */}
        <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 800, 
              fontFamily: theme.typography.fontFamily, 
              mb: 3 
            }}
          >
            Customer Reviews
          </Typography>
          
          {isAuthenticated && (
            <Paper 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                mb: 4, 
                borderRadius: 3,
                boxShadow: 2
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontFamily: theme.typography.fontFamily, 
                  mb: 2,
                  fontWeight: 700
                }}
              >
                Write a Review
              </Typography>
              {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
              <form onSubmit={handleReviewSubmit}>
                <Stack spacing={2.5}>
                  <Rating 
                    value={rating} 
                    onChange={(newValue) => setRating(newValue)} 
                    size="large"
                  />
                  <TextField
                    label="Your Review"
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    fullWidth
                    sx={{ 
                      '& .MuiOutlinedInput-root': { 
                        borderRadius: 2 
                      }, 
                      '& .MuiInputBase-input': { 
                        fontFamily: theme.typography.fontFamily 
                      }
                    }}
                    InputLabelProps={{ 
                      sx: { 
                        fontFamily: theme.typography.fontFamily 
                      } 
                    }}
                  />
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={reviewLoading}
                    sx={{ 
                      alignSelf: 'flex-start', 
                      borderRadius: 3, 
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      boxShadow: 3,
                      '&:hover': {
                        boxShadow: 5
                      }
                    }}
                  >
                    {reviewLoading ? <Loader size="small" color="inherit" /> : 'Submit Review'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          )}

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems={{ xs: 'flex-start', sm: 'center' }} 
            sx={{ mb: 3 }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: theme.typography.fontFamily,
                fontWeight: 700
              }}
            >
              {filteredAndSortedReviews.length} Reviews
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Filter by Rating</InputLabel>
                <Select
                  value={filterRating}
                  label="Filter by Rating"
                  onChange={(e) => setFilterRating(e.target.value)}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2 
                  }}
                >
                  <MenuItem value={0} sx={{ fontFamily: theme.typography.fontFamily }}>All Ratings</MenuItem>
                  <MenuItem value={5} sx={{ fontFamily: theme.typography.fontFamily }}>5 Stars</MenuItem>
                  <MenuItem value={4} sx={{ fontFamily: theme.typography.fontFamily }}>4 Stars</MenuItem>
                  <MenuItem value={3} sx={{ fontFamily: theme.typography.fontFamily }}>3 Stars</MenuItem>
                  <MenuItem value={2} sx={{ fontFamily: theme.typography.fontFamily }}>2 Stars</MenuItem>
                  <MenuItem value={1} sx={{ fontFamily: theme.typography.fontFamily }}>1 Star</MenuItem>
                </Select>
              </FormControl>
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ fontFamily: theme.typography.fontFamily }}>Sort By</InputLabel>
                <Select
                  value={sortOption}
                  label="Sort By"
                  onChange={(e) => setSortOption(e.target.value)}
                  sx={{ 
                    fontFamily: theme.typography.fontFamily, 
                    borderRadius: 2 
                  }}
                >
                  <MenuItem value="newest" sx={{ fontFamily: theme.typography.fontFamily }}>Newest</MenuItem>
                  <MenuItem value="helpful" sx={{ fontFamily: theme.typography.fontFamily }}>Most Helpful</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          {filteredAndSortedReviews.length > 0 ? (
            <Stack spacing={3}>
              {filteredAndSortedReviews.map((review) => (
                <Paper 
                  key={review._id} 
                  sx={{ 
                    p: { xs: 2, md: 3 }, 
                    borderRadius: 3,
                    boxShadow: 1
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar 
                          sx={{ 
                            bgcolor: theme.palette.primary.main,
                            width: 48,
                            height: 48
                          }}
                        >
                          {review.name.charAt(0)}
                        </Avatar>
                        <Stack>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 700, 
                              fontFamily: theme.typography.fontFamily 
                            }}
                          >
                            {review.name}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                        </Stack>
                      </Stack>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          alignSelf: 'flex-start'
                        }}
                      >
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: theme.typography.fontFamily,
                        fontSize: '1.1rem',
                        lineHeight: 1.7
                      }}
                    >
                      {review.comment}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <IconButton 
                        size="small" 
                        onClick={() => handleReviewUpvote(review._id)}
                        disabled={upvotingReviewId === review._id}
                        sx={{ 
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2
                        }}
                      >
                        <ThumbUpIcon fontSize="small" />
                      </IconButton>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: theme.typography.fontFamily,
                          fontWeight: 500
                        }}
                      >
                        {review.upvotes?.length || 0} {review.upvotes?.length === 1 ? 'like' : 'likes'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                fontFamily: theme.typography.fontFamily, 
                textAlign: 'center', 
                py: 6 
              }}
            >
              No reviews yet. Be the first to review this product!
            </Typography>
          )}
        </Box>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 800, 
                fontFamily: theme.typography.fontFamily, 
                mb: 3 
              }}
            >
              Related Products
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((relatedProduct) => (
                <Grid key={relatedProduct._id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <ProductCard product={relatedProduct} showSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg })} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Customer Also Ordered */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 8, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 800, 
                fontFamily: theme.typography.fontFamily, 
                mb: 3 
              }}
            >
              Customer Also Ordered
            </Typography>
            <Grid container spacing={3}>
              {relatedProducts.map((relatedProduct) => (
                <Grid key={relatedProduct._id} size={{ xs: 6, sm: 4, md: 3 }}>
                  <ProductCard product={relatedProduct} showSnackbar={(msg, severity) => setSnackbar({ open: true, message: msg })} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default ProductPage;