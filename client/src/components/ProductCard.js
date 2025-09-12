import React, { useState } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, IconButton, Box, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import userService from '../services/userService';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import StarIcon from '@mui/icons-material/Star';

const ProductCard = ({ product, showSnackbar }) => {
  const theme = useTheme();
  const { user, isAuthenticated, updateUserWishlist } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
    setIsAddingToCart(true);
    try {
      await addToCart(product._id, 1);
      showSnackbar(`${product.name} added to cart!`, 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to add to cart.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
      border: product.isFeatured ? `2px solid ${theme.palette.secondary.main}` : 'none',
      position: 'relative',
    }}>
      <Box sx={{ position: 'relative' }}>
        {product.isFeatured && (
          <Tooltip title="Featured Product">
            <StarIcon sx={{ position: 'absolute', top: 8, left: 8, color: 'secondary.main', zIndex: 1, filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.7))' }} />
          </Tooltip>
        )}
        <CardMedia
          component={RouterLink}
          to={`/product/${product._id}`}
          image={product.image || '/images/placeholder.png'}
          title={product.name}
          sx={{ height: 200, cursor: 'pointer' }}
        />
        {isAuthenticated && (
          <Tooltip title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}>
            <IconButton
              onClick={handleToggleWishlist}
              disabled={isFavoriting}
              sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255, 255, 255, 0.7)', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' } }}
            >
              {isWishlisted ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>{product.name}</Typography>
        <Typography variant="body2" color="text.secondary">{product.category}</Typography>
        <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>${product.price.toFixed(2)}</Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
        <Button fullWidth variant="contained" startIcon={<AddShoppingCartIcon />} onClick={handleAddToCart} disabled={isAddingToCart || product.countInStock === 0}>
          {product.countInStock > 0 ? (isAddingToCart ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;