import React, { useState } from 'react';
import { Box, Typography, Button, Paper, alpha, Chip, Stack, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FlashOnIcon from '@mui/icons-material/FlashOn';
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

  // Calculate effective price
  const effectivePrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.price - product.salePrice) / product.price) * 100) 
    : 0;

  // Determine stock status
  const isLowStock = product.countInStock > 0 && product.countInStock <= 5;
  // Note: isOutOfStock is determined dynamically in the render logic

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
        transition: 'all 0.3s ease',
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
        {/* Badge Stack */}
        <Stack 
          spacing={0.5} 
          sx={{ 
            position: 'absolute', 
            top: 8, 
            left: 8, 
            zIndex: 2,
          }}
        >
          {product.badges?.isNew && (
            <Chip 
              icon={<NewReleasesIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="New" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.info.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                height: '20px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {product.badges?.isOrganic && (
            <Chip 
              icon={<LocalFloristIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="Organic" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.success.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                height: '20px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {product.badges?.isBestseller && (
            <Chip 
              icon={<TrendingUpIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="Bestseller" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.warning.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                height: '20px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {hasDiscount && (
            <Chip 
              icon={<LocalOfferIcon sx={{ fontSize: '0.8rem !important' }} />}
              label={`${discountPercent}% OFF`}
              size="small"
              sx={{ 
                bgcolor: theme.palette.error.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                height: '20px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
          {product.isFeatured && (
            <Chip 
              icon={<FlashOnIcon sx={{ fontSize: '0.8rem !important' }} />}
              label="Featured" 
              size="small"
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.65rem',
                height: '20px',
                '& .MuiChip-icon': { color: 'white' },
              }} 
            />
          )}
        </Stack>
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
        {product.countInStock === 0 && (
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
              sx={{ fontWeight: 'bold' }} 
            />
          </Box>
        )}
        {/* Low stock indicator */}
        {isLowStock && (
          <Chip
            label={`Only ${product.countInStock} left!`}
            size="small"
            color="warning"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              fontWeight: 'bold',
              fontSize: '0.6rem',
              height: '20px',
            }}
          />
        )}
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
        {hasDiscount && (
          <Typography 
            variant="body2" 
            sx={{ 
              textDecoration: 'line-through', 
              color: 'text.secondary',
              fontFamily: theme.typography.fontFamily,
            }}
          >
            ₹{product.price.toFixed(2)}
          </Typography>
        )}
        <Typography variant="h6" color={hasDiscount ? 'error' : 'primary'} sx={{ fontWeight: 'bold', mt: 'auto', fontFamily: theme.typography.fontFamily }}>
          ₹{effectivePrice.toFixed(2)}
          {product.unit && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ fontFamily: theme.typography.fontFamily }}>
              {` / ${product.unit}`}
            </Typography>
          )}
        </Typography>
        
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
              Only {product.countInStock} left in stock!
            </Typography>
          </Box>
        )}
        
        {/* Add to cart button for mobile/small screens */}
        <Button
          variant="contained"
          color="secondary"
          size="small"
          fullWidth
          disabled={isAdding || product.countInStock === 0}
          onClick={handleAddToCart}
          startIcon={<AddShoppingCartIcon />}
          sx={{ 
            mt: 1, 
            fontFamily: theme.typography.fontFamily, 
            fontWeight: 'bold', 
            borderRadius: '50px',
            display: { xs: 'flex', sm: 'none' } // Only show on small screens
          }}
        >
          {product.countInStock > 0 ? (isAdding ? 'Adding...' : 'Add to Cart') : 'Out of Stock'}
        </Button>
      </Box>
    </Paper>
  );
};

export default FeaturedProductCard;