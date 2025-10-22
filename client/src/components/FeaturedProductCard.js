import React, { useState } from 'react';
import { Box, Typography, Button, Paper, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Rating from './Rating';

const FeaturedProductCard = ({ product, showSnackbar }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Prevent the card's link from firing
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login?redirect=/');
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product._id, 1);
      showSnackbar(`${product.name} added to cart!`, 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to add to cart.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Paper
      component={motion.div}
      whileHover={{ y: -8, boxShadow: theme.shadows[10] }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
      }}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <Box
        sx={{
          display: 'block',
          textDecoration: 'none',
          color: 'inherit',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          src={product.image ? `${process.env.REACT_APP_API_URL}${product.image}` : `${process.env.PUBLIC_URL}/images/placeholder.png`}
          alt={product.name}
          sx={{
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '.MuiPaper-root:hover &': {
              opacity: 1,
            },
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            disabled={isAdding || product.countInStock === 0}
            onClick={handleAddToCart}
            startIcon={<AddShoppingCartIcon />}
            sx={{ fontFamily: theme.typography.fontFamily, fontWeight: 'bold', borderRadius: '50px' }}
          >
            {product.countInStock > 0 ? (isAdding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
          </Button>
        </Box>
      </Box>
      <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: theme.typography.fontFamily, flexGrow: 1, lineHeight: 1.3 }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
          <Rating value={product.rating} readOnly size="small" />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, fontFamily: theme.typography.fontFamily }}>
            ({product.numReviews})
          </Typography>
        </Box>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mt: 'auto', fontFamily: theme.typography.fontFamily }}>
          ${product.price.toFixed(2)}
          {product.unit && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              {` / ${product.unit}`}
            </Typography>
          )}
        </Typography>
      </Box>
    </Paper>
  );
};

export default FeaturedProductCard;
