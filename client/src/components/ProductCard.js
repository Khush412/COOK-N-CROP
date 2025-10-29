import React, { useState } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, IconButton, Box, Tooltip, Stack, alpha, Chip, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import userService from '../services/userService';
import Rating from './Rating';
import ProductQuickView from './ProductQuickView';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlashOnIcon from '@mui/icons-material/FlashOn';

const ProductCard = ({ product, showSnackbar, hidePriceAndCart = false, hideCategoryAndUnit = false, hideQuantitySelector = false }) => {
  // All hooks must be called at the top level, before any conditional logic
  const theme = useTheme();
  const { user, isAuthenticated, updateUserWishlist } = useAuth();
  const { cart, addToCart, updateCartItemQuantity, removeCartItem } = useCart();
  const navigate = useNavigate();
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  
  // Now we can safely check for null product and return early
  if (!product || !product._id) {
    console.warn('ProductCard received invalid product data:', product);
    return null;
  }

  const itemInCart = cart?.items?.find(item => item.product && item.product._id === product._id);
  const quantityInCart = itemInCart?.quantity || 0;

  const isWishlisted = user?.wishlist?.includes(product._id);

  // Calculate effective price (sale price if on sale, otherwise regular price)
  const effectivePrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  // Determine stock status
  const isOutOfStock = product.countInStock === 0;
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
  const stockStatus = isOutOfStock 
    ? { text: 'Out of Stock', color: 'error' }
    : isLowStock 
    ? { text: `Only ${product.countInStock} left`, color: 'warning' }
    : null;

  // Get the main image (first image in the array or fallback to single image)
  const getMainImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Fallback for products with single image field
    if (product.image) {
      return product.image;
    }
    return '/images/placeholder.png';
  };

  // Get the full image URL
  const getImageUrl = () => {
    const mainImage = getMainImage();
    if (!mainImage) {
      return `${process.env.PUBLIC_URL}/images/placeholder.png`;
    }
    
    // If it's already a full URL, return it as is
    if (mainImage.startsWith('http')) {
      return mainImage;
    }
    
    // Otherwise, construct the full URL
    return `${process.env.REACT_APP_API_URL}${mainImage}`;
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
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

  const handleAddToCart = async (e) => {
    e.stopPropagation();
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

  const handleUpdateQuantity = async (e, newQuantity) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (newQuantity > product.countInStock) {
      showSnackbar(`Only ${product.countInStock} of ${product.name} available.`, 'warning');
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

  return (
    <Card sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      borderRadius: 4,
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        boxShadow: theme.shadows[6],
      },
      border: product.isFeatured ? `2px solid ${theme.palette.secondary.main}` : `1px solid ${theme.palette.divider}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {/* Badge Stack - Top Left */}
        <Stack 
          spacing={0.5} 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            zIndex: 2,
            maxWidth: '60%',
          }}
        >
          {product.badges?.isNew && (
            <Chip 
              icon={<NewReleasesIcon sx={{ fontSize: '0.9rem !important' }} />}
              label="New" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.info.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: '22px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {product.badges?.isOrganic && (
            <Chip 
              icon={<LocalFloristIcon sx={{ fontSize: '0.9rem !important' }} />}
              label="Organic" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.success.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: '22px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {product.badges?.isBestseller && (
            <Chip 
              icon={<TrendingUpIcon sx={{ fontSize: '0.9rem !important' }} />}
              label="Bestseller" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.warning.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: '22px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {hasDiscount && (
            <Chip 
              icon={<LocalOfferIcon sx={{ fontSize: '0.9rem !important' }} />}
              label={`${discountPercent}% OFF`}
              size="small"
              sx={{ 
                bgcolor: theme.palette.error.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: '22px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {product.isFeatured && (
            <Chip 
              icon={<FlashOnIcon sx={{ fontSize: '0.9rem !important' }} />}
              label="Featured" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                height: '22px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
        </Stack>
        <CardMedia
          component={RouterLink}
          to={`/product/${product._id}`}
          image={getImageUrl()}
          title={product.name}
          sx={{
            height: 180, // Fixed height instead of aspect ratio
            objectFit: 'cover', // Cover the area without distortion
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        {isOutOfStock && (
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: alpha(theme.palette.background.paper, 0.85),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3,
            backdropFilter: 'blur(3px)',
          }}>
            <Chip 
              label="Out of Stock" 
              color="error" 
              variant="filled" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '0.9rem',
                py: 2,
              }} 
            />
          </Box>
        )}
        {/* Wishlist & Quick View - Top Right */}
        <Stack 
          direction="row" 
          spacing={0.5}
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            zIndex: 2,
          }}
        >
          {isAuthenticated && (
            <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
              <IconButton
                onClick={handleToggleWishlist}
                disabled={isFavoriting}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  '&:hover': { backgroundColor: alpha(theme.palette.background.paper, 1) }
                }}
              >
                {isWishlisted ? <FavoriteIcon color="error" fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Quick View">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                '&:hover': { backgroundColor: alpha(theme.palette.background.paper, 1) }
              }}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        {/* Low stock indicator */}
        {isLowStock && !isOutOfStock && (
          <Chip
            label={stockStatus.text}
            color={stockStatus.color}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              zIndex: 2,
              fontWeight: 'bold',
              fontSize: '0.65rem',
              height: '20px',
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1.5, pb: 0.5 }}>
        {/* Conditionally render category and rating based on hideCategoryAndUnit prop */}
        {!hideCategoryAndUnit && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography gutterBottom variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {product.category}
            </Typography>
            {product.rating > 0 && (
              <Typography variant="caption" sx={{ fontFamily: theme.typography.fontFamily, color: 'text.secondary', fontWeight: 'bold' }}>
                {product.rating.toFixed(1)} ★
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, lineHeight: 1.3, minHeight: '2.6em', mb: 0.5 }}>
          {product.name}
        </Typography>
        {/* Stock Status Indicator */}
        {stockStatus && !isLowStock && (
          <Chip 
            label={stockStatus.text}
            color={stockStatus.color}
            size="small"
            variant="outlined"
            sx={{ 
              fontSize: '0.7rem',
              height: '20px',
              fontWeight: 600,
            }}
          />
        )}
        
        {/* Stock progress bar for low stock items */}
        {isLowStock && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={(product.countInStock / 5) * 100} 
              color="warning"
              sx={{ height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block', fontFamily: theme.typography.fontFamily }}>
              Only {product.countInStock} left!
            </Typography>
          </Box>
        )}
      </CardContent>
      {/* Conditionally render CardActions based on hidePriceAndCart prop */}
      {!hidePriceAndCart && (
        <CardActions sx={{ p: 1.5, pt: 0.5, mt: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
            <Box>
              {hasDiscount && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    textDecoration: 'line-through', 
                    color: 'text.secondary',
                    fontFamily: theme.typography.fontFamily,
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  ₹{product.price.toFixed(2)}
                </Typography>
              )}
              <Typography variant="h6" color={hasDiscount ? 'error' : 'primary'} sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                ₹{effectivePrice.toFixed(2)}
                {/* Conditionally render unit based on hideCategoryAndUnit prop */}
                {!hideCategoryAndUnit && product.unit && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
                    {` / ${product.unit}`}
                  </Typography>
                )}
              </Typography>
            </Box>
            {product.countInStock > 0 ? (
              hideQuantitySelector && quantityInCart > 0 ? (
                // Just show the cart button when quantity selector is hidden
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddShoppingCartIcon fontSize="small" />}
                  onClick={handleAddToCart}
                  disabled={isCartLoading}
                  sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily, fontWeight: 'bold', textTransform: 'none', px: 2 }}
                >
                  {isCartLoading ? <CircularProgress size={16} color="inherit" /> : 'Add'}
                </Button>
              ) : quantityInCart > 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: `1px solid ${theme.palette.divider}`, borderRadius: '50px' }}>
                  <IconButton size="small" onClick={(e) => handleUpdateQuantity(e, quantityInCart - 1)} disabled={isCartLoading}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ mx: 1, fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>{quantityInCart}</Typography>
                  <IconButton size="small" onClick={(e) => handleUpdateQuantity(e, quantityInCart + 1)} disabled={isCartLoading || quantityInCart >= product.countInStock}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={isCartLoading ? <CircularProgress size={16} color="inherit" /> : <AddShoppingCartIcon fontSize="small" />}
                  onClick={handleAddToCart}
                  disabled={isCartLoading}
                  sx={{ borderRadius: '50px', fontFamily: theme.typography.fontFamily, fontWeight: 'bold', textTransform: 'none', px: 2 }}
                >
                  {isCartLoading ? '...' : 'Add'}
                </Button>
              )
            ) : null}
          </Stack>
        </CardActions>
      )}
      
      {/* Quick View Modal */}
      <ProductQuickView 
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        showSnackbar={showSnackbar}
      />
    </Card>
  );
};

export default ProductCard;