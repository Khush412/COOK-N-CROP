import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  Stack,
  Chip,
  Divider,
  alpha,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CloseIcon from '@mui/icons-material/Close';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Rating from './Rating';
import userService from '../services/userService';

const ProductQuickView = ({ product, open, onClose, showSnackbar }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUserWishlist } = useAuth();
  const { cart, addToCart, updateCartItemQuantity, removeCartItem } = useCart();
  const sliderRef = useRef(null);

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Comprehensive null check for product
  if (!product || !product._id) {
    console.warn('ProductQuickView received invalid product data:', product);
    return null;
  }

  // Safe access to cart item with null checks
  const itemInCart = cart?.items?.find(item => item.product && item.product._id === product._id);
  const quantityInCart = itemInCart?.quantity || 0;
  const isWishlisted = user?.wishlist?.includes(product._id);

  // Calculate effective price
  const effectivePrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  // Stock status
  const isOutOfStock = product.countInStock === 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/CropCorner');
      return;
    }
    setIsCartLoading(true);
    try {
      await addToCart(product._id, 1);
      showSnackbar(`${product.name} added to cart!`, 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to add to cart.', 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity) => {
    if (!isAuthenticated) return;
    if (newQuantity > product.countInStock) {
      showSnackbar(`Only ${product.countInStock} available.`, 'warning');
      return;
    }
    setIsCartLoading(true);
    try {
      if (newQuantity > 0) {
        await updateCartItemQuantity(product._id, newQuantity);
      } else {
        await removeCartItem(product._id);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update cart.', 'error');
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/CropCorner');
      return;
    }
    setIsFavoriting(true);
    try {
      const res = await userService.toggleWishlist(product._id);
      if (res.success) {
        updateUserWishlist(res.wishlist);
        showSnackbar(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success');
      }
    } catch (err) {
      showSnackbar('Failed to update wishlist.', 'error');
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/product/${product._id}`);
  };

  // Get all product images
  const getProductImages = () => {
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    // Fallback for products with single image field
    if (product.image) {
      return [product.image];
    }
    return ['/images/placeholder.png'];
  };

  // Get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `${process.env.PUBLIC_URL}/images/placeholder.png`;
    }
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Otherwise, construct the full URL
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  // Function to handle thumbnail click
  const handleThumbnailClick = (index) => {
    if (sliderRef.current) {
      if (typeof sliderRef.current.slickGoTo === 'function') {
        sliderRef.current.slickGoTo(index);
      } else if (sliderRef.current.innerSlider && typeof sliderRef.current.innerSlider.slickGoTo === 'function') {
        sliderRef.current.innerSlider.slickGoTo(index);
      }
    }
  };

  // Slider settings for product images
  const sliderSettings = {
    dots: true,
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
    afterChange: (current) => setCurrentSlide(current),
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          arrows: false
        }
      }
    ]
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          zIndex: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          '&:hover': { bgcolor: alpha(theme.palette.background.paper, 1) }
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          {/* Product Images Carousel */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ position: 'relative' }}>
              <Slider {...sliderSettings} ref={sliderRef}>
                {getProductImages().map((image, index) => (
                  <Box key={index} sx={{ position: 'relative', pt: '100%' }}>
                    <Box
                      component="img"
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
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
                ))}
              </Slider>
              
              {/* Image counter badge */}
              {getProductImages().length > 1 && (
                <Chip
                  label={`${currentSlide + 1} / ${getProductImages().length}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    fontWeight: 'bold',
                    backdropFilter: 'blur(4px)'
                  }}
                />
              )}
            </Box>
            
            {/* Thumbnail gallery for multiple images */}
            {getProductImages().length > 1 && (
              <ImageList 
                sx={{ 
                  mt: 2, 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr)) !important',
                  gap: '8px !important'
                }} 
                cols={5} 
                gap={8}
              >
                {getProductImages().map((image, index) => (
                  <ImageListItem 
                    key={index} 
                    sx={{ 
                      borderRadius: 1, 
                      overflow: 'hidden',
                      border: currentSlide === index ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        border: `2px solid ${theme.palette.primary.main}`,
                      }
                    }}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <Box
                      component="img"
                      src={getImageUrl(image)}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 60,
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              {/* Category */}
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                {product.category}
              </Typography>

              {/* Product Name */}
              <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                {product.name}
              </Typography>

              {/* Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {product.badges?.isNew && (
                  <Chip icon={<NewReleasesIcon />} label="New" size="small" color="info" />
                )}
                {product.badges?.isOrganic && (
                  <Chip icon={<LocalFloristIcon />} label="Organic" size="small" color="success" />
                )}
                {product.badges?.isBestseller && (
                  <Chip icon={<TrendingUpIcon />} label="Bestseller" size="small" color="warning" />
                )}
                {hasDiscount && (
                  <Chip icon={<LocalOfferIcon />} label={`${discountPercent}% OFF`} size="small" color="error" />
                )}
              </Stack>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={product.rating} readOnly />
                <Typography variant="body2" color="text.secondary">
                  ({product.numReviews} reviews)
                </Typography>
              </Box>

              <Divider />

              {/* Price */}
              <Box>
                {hasDiscount && (
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      textDecoration: 'line-through', 
                      color: 'text.secondary',
                      fontFamily: theme.typography.fontFamily,
                    }}
                  >
                    ₹{product.price.toFixed(2)}
                  </Typography>
                )}
                <Typography variant="h3" color={hasDiscount ? 'error' : 'primary'} sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                  ₹{effectivePrice.toFixed(2)}
                  {product.unit && (
                    <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                      / {product.unit}
                    </Typography>
                  )}
                </Typography>
              </Box>

              {/* Stock Status */}
              <Box>
                {isOutOfStock ? (
                  <Chip label="Out of Stock" color="error" />
                ) : isLowStock ? (
                  <Chip label={`Only ${product.countInStock} left`} color="warning" />
                ) : (
                  <Chip label="In Stock" color="success" variant="outlined" />
                )}
              </Box>

              {/* Description */}
              <Typography variant="body1" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                {product.description}
              </Typography>

              <Divider />

              {/* Actions */}
              <Stack direction="row" spacing={2} alignItems="center">
                {!isOutOfStock && (
                  <>
                    {quantityInCart > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: `2px solid ${theme.palette.primary.main}`, borderRadius: '50px', px: 1 }}>
                        <IconButton size="small" onClick={() => handleUpdateQuantity(quantityInCart - 1)} disabled={isCartLoading}>
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 2, fontWeight: 'bold', fontSize: '1.2rem' }}>{quantityInCart}</Typography>
                        <IconButton size="small" onClick={() => handleUpdateQuantity(quantityInCart + 1)} disabled={isCartLoading || quantityInCart >= product.countInStock}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    ) : (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={handleAddToCart}
                        disabled={isCartLoading}
                        sx={{ borderRadius: '50px', px: 4, fontWeight: 'bold' }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </>
                )}
                
                {isAuthenticated && (
                  <IconButton 
                    onClick={handleToggleWishlist} 
                    disabled={isFavoriting}
                    sx={{ 
                      border: `2px solid ${theme.palette.divider}`,
                      '&:hover': { 
                        borderColor: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                      }
                    }}
                  >
                    {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                  </IconButton>
                )}
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3 }}>
        <Button onClick={handleViewFullDetails} variant="outlined" size="large" sx={{ borderRadius: '50px', px: 3 }}>
          View Full Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductQuickView;