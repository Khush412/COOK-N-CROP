import React, { useState } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, IconButton, Box, Tooltip, Stack, alpha, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import userService from '../services/userService';
import Rating from './Rating';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import StarIcon from '@mui/icons-material/Star';
import CircularProgress from '@mui/material/CircularProgress';

const ProductCard = ({ product, showSnackbar }) => {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserWishlist } = useAuth();
  const { cart, addToCart, updateCartItemQuantity, removeCartItem } = useCart();
  const navigate = useNavigate();
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  const itemInCart = cart?.items?.find(item => item.product._id === product._id);
  const quantityInCart = itemInCart?.quantity || 0;

  const isWishlisted = user?.wishlist?.includes(product._id);

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
        {product.isFeatured && (
          <Tooltip title="Featured Product">
            <StarIcon sx={{ position: 'absolute', top: 8, left: 8, color: 'secondary.main', zIndex: 1, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.7))' }} />
          </Tooltip>
        )}
        <CardMedia
          component={RouterLink}
          to={`/product/${product._id}`}
          image={product.image || `${process.env.PUBLIC_URL}/images/placeholder.png`}
          title={product.name}
          sx={{
            aspectRatio: '4/3',
            cursor: 'pointer',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        />
        {product.countInStock === 0 && (
          <Box sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            backdropFilter: 'blur(2px)',
          }}>
            <Chip label="Out of Stock" color="default" variant="filled" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }} />
          </Box>
        )}
        {isAuthenticated && (
          <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
            <IconButton
              onClick={handleToggleWishlist}
              disabled={isFavoriting}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                '&:hover': { backgroundColor: alpha(theme.palette.background.paper, 1) }
              }}
            >
              {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1.5, pb: 0.5 }}>
        <Typography gutterBottom variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {product.category}
        </Typography>
        <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily, lineHeight: 1.3, minHeight: '2.6em', mb: 0.5 }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Rating value={product.rating} readOnly size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontFamily: theme.typography.fontFamily, lineHeight: 1 }}>
            ({product.numReviews})
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ p: 1.5, pt: 0.5, mt: 'auto' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
            ${product.price.toFixed(2)}
          </Typography>
          {product.countInStock > 0 ? (
            quantityInCart > 0 ? (
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
    </Card>
  );
};

export default ProductCard;