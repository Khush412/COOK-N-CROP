import React, { useState } from 'react';
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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  if (!product) return null;

  const itemInCart = cart?.items?.find(item => item.product._id === product._id);
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
          {/* Product Image */}
          <Grid item xs={12} md={5}>
            <Box
              component="img"
              src={product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`}
              alt={product.name}
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 2,
                boxShadow: theme.shadows[3],
              }}
            />
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={7}>
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
